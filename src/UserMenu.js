import React, { useState, useEffect, useMemo, useContext } from "react";
import "./user-menu.css";
import { MenuContext } from "./Layout";
import Papa from "papaparse";

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const stars = [];
  for (let i = 0; i < fullStars; i++) stars.push("★");
  if (hasHalfStar) stars.push("☆"); // oppure ⯨ per una mezza stella stilizzata
  for (let i = 0; i < emptyStars; i++) stars.push("☆");

  return stars.join("");
}

function stringToSeed(str) {
  return str.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
}

function colorsFromSeed(seed) {
  const h = seed % 360;
  return [
    `hsl(${h}, 70%, 90%)`,
    `hsl(${(h + 60) % 360}, 70%, 60%)`,
    `hsl(${(h + 120) % 360}, 70%, 50%)`,
  ];
}

function generateDynamicSVG(name) {
  const seed = stringToSeed(name);
  const [bg, col1, col2] = colorsFromSeed(seed);
  const shapeType = seed % 3;

  let inner;
  if (shapeType === 0) {
    inner = `
      <circle cx="200" cy="100" r="60" fill="${col1}" opacity="0.8"/>
      <circle cx="150" cy="90" r="40" fill="${col2}" opacity="0.6"/>
    `;
  } else if (shapeType === 1) {
    inner = `
      <rect x="100" y="40" width="200" height="120" fill="${col1}" rx="20" ry="20"/>
      <rect x="140" y="80" width="120" height="60" fill="${col2}" rx="10" ry="10" opacity="0.7"/>
    `;
  } else {
    inner = `
      <path d="M50 150 Q200 ${
        50 + (seed % 50)
      } 350 150" stroke="${col1}" stroke-width="8" fill="none"/>
      <circle cx="${100 + (seed % 200)}" cy="${
      80 + (seed % 40)
    }" r="30" fill="${col2}" opacity="0.7"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
      <rect fill="${bg}" width="400" height="200"/>
      ${inner}
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function mapForUserMenu(item) {
  const name = item.Item || "-";
  const seed = stringToSeed(name);
  const [bgColor, accentColor] = colorsFromSeed(seed);
  const rawUrl = item.Foto?.trim();
  const isDrive = /drive\.google\.com/.test(rawUrl);
  const imageUrl = rawUrl
    ? isDrive
      ? `https://troubled-neighborly-petalite.glitch.me/api/proxy-image?url=${encodeURIComponent(
          rawUrl
        )}`
      : rawUrl
    : generateDynamicSVG(name);

  return {
    id: item.id,
    name,
    subCategory: item["Sotto-categoria"] || "Altro",
    group: item["Categoria"] || "Generico",
    image: imageUrl, // 👈 QUI
    bgColor,
    accentColor,
    ingredients: item["Ingredienti principali"]
      ? item["Ingredienti principali"].split(",").map((x) => x.trim())
      : [],
    description: item.Storytelling || "",
    price:
      typeof item["Prezzo di vendita"] === "number"
        ? `€${item["Prezzo di vendita"].toFixed(2)}`
        : item["Prezzo di vendita"]
        ? `€${parseFloat(item["Prezzo di vendita"]).toFixed(2)}`
        : "-",
    rating: parseFloat(item["Popolarità prevista"]) || 0,
    waterFootprint: Number(item["Impronta idrica"]) || 0,
    carbonFootprint: Number(item["Impronta carbonica"]) || 0,
    maxWater: 500,
    maxCarbon: 2,
  };
}

const UserMenu = () => {
  const { menuItems } = useContext(MenuContext);
  const [mainCategory, setMainCategory] = useState("Cocktail");
  const [subFilter, setSubFilter] = useState("Tutti");
  const [flipped, setFlipped] = useState({});
  const [remoteItems, setRemoteItems] = useState([]);

  // ⬇️ Inserisci qui sotto
  useEffect(() => {
    fetch("https://troubled-neighborly-petalite.glitch.me/api/menu-json")
      .then((res) => {
        if (!res.ok) throw new Error("Errore nella risposta dal server");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Dati ricevuti da Glitch:", data);
        setRemoteItems(data);
      })
      .catch((err) => {
        console.error("❌ Errore nel fetch da Glitch:", err);
      });
  }, []);

  const mappedItems = (
    remoteItems.length > 0 ? remoteItems : menuItems || []
  ).map(mapForUserMenu);

  const mainCategories = Array.from(
    new Set(mappedItems.map((item) => item.group))
  );
  const subFilters = [
    "Tutti",
    ...Array.from(
      new Set(
        mappedItems
          .filter((item) => item.group === mainCategory)
          .map((item) => item.subCategory)
      )
    ),
  ];

  const filteredItems = mappedItems.filter(
    (item) =>
      item.group === mainCategory &&
      (subFilter === "Tutti" || item.subCategory === subFilter)
  );

  const handleFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="user-menu-page"
      style={{
        backgroundImage: `
  linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.55)),
  url(${process.env.PUBLIC_URL}/Pattern.jpg)
`,
        backgroundRepeat: "no-repeat", // ← niente mosaico
        backgroundSize: "cover", // ← scala per coprire tutta l’area
        backgroundPosition: "center", // ← centrato (opzionale)
        minHeight: "100vh",
      }}
    >
      <div className="user-menu-top-wrapper">
        <div className="user-menu-logo-column">
          <img
            src="/ChatGPT Image 22 giu 2025, 16_23_54.png"
            alt="Carita Morena x Zenzo Bar"
            className="user-menu-logo-fullheight"
          />
        </div>

        <div className="user-menu-header-content">
          <header className="user-menu-header-redesign">
            <div className="user-menu-header-text">
              <h1 className="user-menu-header-title">
                Scopri i nostri drink naturali
              </h1>
              <p className="user-menu-header-subtitle">
                Freschi, mediterranei e senza zuccheri aggiunti
              </p>
              <p className="user-menu-header-explore">Esplora le categorie</p>
            </div>
          </header>

          <div className="user-menu-categories-wrapper">
            <div className="user-menu-container">
              <div className="user-menu-categories-icons">
                {mainCategories.map((cat) => {
                  const getIconForCategory = (category) => {
                    switch (category.toLowerCase()) {
                      case "bevande":
                        return "🥤"; // bevanda generica
                      case "cocktail":
                        return "🍹";
                      case "crepe":
                        return "🧇"; // simile a una crepe dolce
                      case "croissant":
                        return "🥐";
                      case "dolce":
                        return "🍰";
                      case "frutta":
                        return "🍓";
                      case "panino":
                        return "🥪";
                      case "piatto":
                        return "🍽️"; // generico, piatto completo
                      case "tagliere":
                        return "🧀"; // rappresenta formaggi/salumi
                      default:
                        return "🌿"; // fallback naturale
                    }
                  };

                  return (
                    <button
                      key={cat}
                      className={
                        "user-menu-category-box" +
                        (mainCategory === cat ? " active" : "")
                      }
                      onClick={() => {
                        setMainCategory(cat);
                        setSubFilter("Tutti");
                        setFlipped({});
                      }}
                      type="button"
                    >
                      <div className="category-icon">
                        {getIconForCategory(cat)}
                      </div>
                      <div className="category-name">{cat}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="user-menu-container">
        <div className="user-menu-grid">
          {filteredItems.map((item) => {
            const waterPercentage = (item.waterFootprint / item.maxWater) * 100;
            const carbonPercentage =
              (item.carbonFootprint / item.maxCarbon) * 100;
            return (
              <div
                key={item.id}
                className={
                  "user-menu-card" + (flipped[item.id] ? " flipped" : "")
                }
                onClick={() => handleFlip(item.id)}
              >
                <div className="user-menu-card-inner">
                  <div className="user-menu-card-front">
                    <div className="user-menu-image-wrapper">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="user-menu-card-image"
                      />
                    </div>
                    <div className="user-menu-card-content">
                      <div className="user-menu-card-header">
                        <div className="user-menu-title-stars-row">
                          <h3 className="user-menu-card-title">{item.name}</h3>
                          <span className="user-menu-stars">
                            {renderStars(item.rating)}
                          </span>
                        </div>
                        <p className="user-menu-card-price">{item.price}</p>
                      </div>
                      <div className="user-menu-eco-metrics">
                        <div className="user-menu-eco-metric">
                          <span className="user-menu-eco-icon">💧</span>
                          <div className="user-menu-eco-bar">
                            <div
                              className="user-menu-eco-fill"
                              style={{ width: `${waterPercentage}%` }}
                            />
                          </div>
                          <span className="user-menu-eco-value">
                            {item.waterFootprint}L
                          </span>
                        </div>
                        <div className="user-menu-eco-metric">
                          <span className="user-menu-eco-icon">🌱</span>
                          <div className="user-menu-eco-bar">
                            <div
                              className="user-menu-eco-fill"
                              style={{ width: `${carbonPercentage}%` }}
                            />
                          </div>
                          <span className="user-menu-eco-value">
                            {item.carbonFootprint}kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="user-menu-card-back">
                    <h3 className="user-menu-card-title">{item.name}</h3>
                    <div className="user-menu-ingredients-section">
                      <p className="user-menu-ingredients-title">
                        Ingredienti:
                      </p>
                      <ul className="user-menu-ingredients-list">
                        {item.ingredients.map((ing, i) => (
                          <li key={i} className="user-menu-ingredient-tag">
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="user-menu-description">{item.description}</p>
                    <div className="user-menu-back-footer">
                      <span className="user-menu-card-price">{item.price}</span>
                      <div>
                        <span>💧 {item.waterFootprint}L</span>
                        <span style={{ marginLeft: "1rem" }}>
                          🌱 {item.carbonFootprint}kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
