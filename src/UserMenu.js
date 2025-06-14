import React, { useState, useEffect, useMemo, useContext } from "react";
import "./user-menu.css";
import { MenuContext } from "./Layout";
import Papa from "papaparse";

// 👇 Utility: trasforma una stringa in un numero “casuale” (semplice hash)
function stringToSeed(str) {
  return str
    .split("")
    .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
}

// 👇 Genera una palette HSL da uno seed
function colorsFromSeed(seed) {
  const h = seed % 360;
  return [
    `hsl(${h}, 70%, 90%)`,            // sfondo chiaro
    `hsl(${(h + 60) % 360}, 70%, 60%)`,// forma grande
    `hsl(${(h + 120) % 360}, 70%, 50%)`// forma piccola
  ];
}

// 👇 Genera il data-uri SVG in base al seed
function generateDynamicSVG(name) {
  const seed = stringToSeed(name);
  const [bg, col1, col2] = colorsFromSeed(seed);
  const shapeType = seed % 3; // 0=circle,1=rect,2=path

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
      <path d="M50 150 Q200 ${50 + (seed % 50)} 350 150" stroke="${col1}" stroke-width="8" fill="none"/>
      <circle cx="${100 + (seed % 200)}" cy="${80 + (seed % 40)}" r="30" fill="${col2}" opacity="0.7"/>
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

// Utility per chiavi lowercase (aggiungi qui)
function normalizeKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.trim().toLowerCase(), v])
  );
}

// Mapping adattato alla struttura del tuo CSV,
// con background dinamico e bordo accentuato
function mapForUserMenu(item) {
  const name = item.Item || "-";
  // 1) calcola seed e palette
  const seed = stringToSeed(name);
  const [bgColor, accentColor] = colorsFromSeed(seed);

  // 2) immagine: CSV o SVG generativo
  const imageFromCsv = item.Foto?.trim() ? item.Foto : null;
  const image = imageFromCsv || generateDynamicSVG(name);

  return {
    id: item.id,
    name,
    category:
      item.Categoria === "Classic"
        ? "food"
        : item.Categoria === "Carita Morena"
        ? "beverages"
        : item.Categoria === "Linea Z"
        ? "desserts"
        : "food",
    image,
    // 3) qui i due colori extra
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
    waterFootprint: Number(item["Impronta idrica"]) || 0,
    carbonFootprint: Number(item["Impronta carbonica"]) || 0,
    maxWater: 500,
    maxCarbon: 2,
  };
}

const categories = [
  { key: "all", label: "Tutti" },
  { key: "beverages", label: "Bevande" },
  { key: "food", label: "Cibo" },
  { key: "desserts", label: "Dolci" },
];

const UserMenu = () => {
  const { menuItems } = useContext(MenuContext);

  console.log("🧩 UserMenu: menuItems ricevuti dal context:", menuItems);

  const [category, setCategory] = useState("all");
  const [flipped, setFlipped] = useState({});

  const mappedItems = (menuItems || []).map(mapForUserMenu);

  const filteredItems =
    category === "all"
      ? mappedItems
      : mappedItems.filter((item) => item.category === category);

  const handleFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="user-menu-page"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)),
          url(${process.env.PUBLIC_URL}/CS01.png)
        `,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        backgroundSize: 'auto',
      }}
    >
      <header className="user-menu-header">
        <h1>Carita Morena × Zenzo Bar</h1>
      </header>
      <div className="user-menu-categories-wrapper">
        <div className="user-menu-container">
          <div className="user-menu-categories">
            {categories.map((cat) => (
              <button
                key={cat.key}
                className={
                  "user-menu-category-btn" +
                  (category === cat.key ? " active" : "")
                }
                onClick={() => {
                  setCategory(cat.key);
                  setFlipped({});
                }}
                type="button"
              >
                {cat.label}
              </button>
            ))}
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
                  {/* FRONT */}
                  <div className="user-menu-card-front">
  {/* ① wrapper centratore */}
  <div className="user-menu-image-wrapper">
    <img
      src={item.image}
      alt={item.name}
      className="user-menu-card-image"
    />
  </div>

  {/* ② contenuto sotto l’immagine */}
  <div className="user-menu-card-content">
    <div className="user-menu-card-header">
      <h3 className="user-menu-card-title">{item.name}</h3>
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
                  {/* BACK */}
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
