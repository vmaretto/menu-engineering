import React, { useState, useEffect, useMemo, useContext } from "react";
import "./user-menu.css";
import { MenuContext } from "./Layout";
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Save,
  X,
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
} from "lucide-react";
import Papa from "papaparse";

// ⬇️⬇️⬇️ METTI QUI LE FUNZIONI! ⬇️⬇️⬇️

// Utility per chiavi lowercase (metti questa in alto nel file!)
function normalizeKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.trim().toLowerCase(), v])
  );
}

// Mappa le categorie testuali del CSV in chiavi standard UserMenu
function getCategoryKey(cat) {
  if (!cat) return "food";
  const c = cat.toLowerCase();
  if (c.includes("bevanda") || c.includes("drink")) return "beverages";
  if (c.includes("dolce")) return "desserts";
  return "food";
}

// Trasforma ogni item nel formato richiesto da UserMenu
function mapForUserMenu(item) {
  return {
    id: item.id || item.ID || item.Item || Math.random(),
    name: item.Item || item.name || "-",
    category:
      item.Categoria === "Classic"
        ? "food"
        : item.Categoria === "Carita Morena"
        ? "beverages"
        : item.Categoria === "Linea Z"
        ? "desserts"
        : "food",
    image: item.Foto || "https://via.placeholder.com/150",
    ingredients: item["Ingredienti principali"]
      ? item["Ingredienti principali"].split(",").map((x) => x.trim())
      : [],
    description: item.Storytelling || "",
    price: item["Prezzo di vendita"]
      ? `€${parseFloat(item["Prezzo di vendita"]).toFixed(2)}`
      : "-",
    waterFootprint: Number(item["Impronta idrica"]) || 0,
    carbonFootprint: Number(item["Impronta carbonica"]) || 0,
    maxWater: 500,
    maxCarbon: 2,
  };
}

const ZenzoMenuDashboard = () => {
  const { menuItems, setMenuItems } = useContext(MenuContext);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFasciaOraria, setSelectedFasciaOraria] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Sostituisci la funzione handleUpload con questa
  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      Papa.parse(target.result, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mapped = results.data.map((row, i) => {
            const r = normalizeKeys(row);

            const prezzo = parseFloat(r.prezzo) || 0;
            const costo = parseFloat(r.costo) || 0;
            const foodCost = parseFloat(r["food cost %"]) || 0;
            const margine = prezzo - costo;

            return {
              id: i + 1,
              Item: r.item || "",
              Categoria: r.categoria || "",
              "Fascia oraria": r.fascia || "",
              "Prezzo di vendita": prezzo,
              "Costo unitario": costo,
              "Margine lordo": margine,
              "Food cost %": foodCost,
              "Popolarità prevista": r.popolarità || "",
              "Ingredienti principali": r["ingredienti principali"] || "",
              Storytelling: r.storytelling || "",
              "Impronta idrica": r["impronta idrica"] || "",
              "Impronta carbonica": r["impronta carbonica"] || "",
              Foto: r.foto || "",
            };
          });

          setMenuItems(mapped);
          setFilteredItems(mapped);
          setShowUpload(false);
          console.log("🍀 Mapped CSV:", mapped.slice(0, 2));
        },
        error: (err) => {
          console.error("❌ Errore parsing CSV:", err);
          setShowUpload(false);
        },
      });
    };
    reader.readAsText(file);
  };

  // Form di upload CSV
  const UploadForm = ({ onUpload, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Carica CSV</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            if (e.target.files.length) onUpload(e.target.files[0]);
          }}
          className="w-full mb-4"
        />
        <button
          onClick={onClose}
          className="mt-2 w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Annulla
        </button>
      </div>
    </div>
  );

  // Genera dati demo completi basati sui veri dati di Zenzo
  const generateDemoData = () => {
    return [
      {
        id: 1,
        Fase: "Avvio",
        "Fascia oraria": "Colazione",
        Item: "Croissant con crema allo zenzero e limone",
        Categoria: "Linea Z",
        "Sub-Categoria": "Croissant",
        "Prodotto finito/Da preparare": "Da preparare",
        Fornitore: "Bonfitto",
        "Ingredienti principali": "farina, burro, crema allo zenzero e limone",
        Formato: "Porzione singola",
        "Prezzo di vendita": 2.5,
        "Costo unitario": 0.8,
        "Margine lordo": 1.7,
        "Food cost %": 32.0,
        "Tempo di preparazione": "20 min",
        "Popolarità prevista": "Alta",
        Storytelling:
          "Ripieno agrumato e speziato per una colazione unica e stimolante.",
        Qty: 0,
      },
      {
        id: 2,
        Fase: "Avvio",
        "Fascia oraria": "All day",
        Item: "Bevanda naturale allo zenzero",
        Categoria: "Linea Z",
        "Sub-Categoria": "Bevande",
        "Prodotto finito/Da preparare": "Da preparare",
        Fornitore: "Interno",
        "Ingredienti principali": "Zenzero fresco, limone, miele, acqua fredda",
        Formato: "Bicchiere 330ml",
        "Prezzo di vendita": 3.5,
        "Costo unitario": 1.2,
        "Margine lordo": 2.3,
        "Food cost %": 34.3,
        "Tempo di preparazione": "2 min",
        "Popolarità prevista": "Alta",
        Storytelling: "Fresco, dissetante, con le note pungenti dello zenzero.",
        Qty: 0,
      },
      {
        id: 3,
        Fase: "Avvio",
        "Fascia oraria": "Pranzo",
        Item: "Pizza con zenzero e verdure di stagione",
        Categoria: "Linea Z",
        "Sub-Categoria": "Pizza",
        "Prodotto finito/Da preparare": "Da preparare",
        Fornitore: "Interno",
        "Ingredienti principali":
          "impasto pizza, zenzero, verdure stagionali, mozzarella",
        Formato: "Pizza intera",
        "Prezzo di vendita": 12.0,
        "Costo unitario": 4.5,
        "Margine lordo": 7.5,
        "Food cost %": 37.5,
        "Tempo di preparazione": "15 min",
        "Popolarità prevista": "Alta",
        Storytelling:
          "Pizza gourmet con il twist speziato dello zenzero e verdure fresche.",
        Qty: 0,
      },
      {
        id: 4,
        Fase: "Avvio",
        "Fascia oraria": "All day",
        Item: "Caffè espresso",
        Categoria: "Classic",
        "Sub-Categoria": "Caffetteria",
        "Prodotto finito/Da preparare": "Da preparare",
        Fornitore: "Lavazza",
        "Ingredienti principali": "caffè arabica",
        Formato: "Tazzina",
        "Prezzo di vendita": 1.2,
        "Costo unitario": 0.3,
        "Margine lordo": 0.9,
        "Food cost %": 25.0,
        "Tempo di preparazione": "1 min",
        "Popolarità prevista": "Alta",
        Storytelling:
          "Espresso perfetto, cremoso e aromatico per ogni momento della giornata.",
        Qty: 0,
      },
      {
        id: 5,
        Fase: "Avvio",
        "Fascia oraria": "Cena",
        Item: "Tiramisù allo zenzero",
        Categoria: "Linea Z",
        "Sub-Categoria": "Dolci",
        "Prodotto finito/Da preparare": "Da preparare",
        Fornitore: "Interno",
        "Ingredienti principali":
          "mascarpone, savoiardi, caffè, zenzero candito",
        Formato: "Porzione singola",
        "Prezzo di vendita": 6.5,
        "Costo unitario": 2.2,
        "Margine lordo": 4.3,
        "Food cost %": 33.8,
        "Tempo di preparazione": "30 min",
        "Popolarità prevista": "Alta",
        Storytelling:
          "Il classico tiramisù reinterpretato con note piccanti di zenzero.",
        Qty: 0,
      },
      {
        id: 6,
        Fase: "Avvio",
        "Fascia oraria": "Cena",
        Item: "Insalata Zenzo con vinaigrette allo zenzero",
        Categoria: "Linea Z",
        "Sub-Categoria": "Insalate",
        "Prodotto finito/Da preparare": "Da preparare",
        Fornitore: "Casale 100 Corvi",
        "Ingredienti principali": "mix insalate, zenzero, olio evo, aceto",
        Formato: "Porzione grande",
        "Prezzo di vendita": 8.0,
        "Costo unitario": 3.2,
        "Margine lordo": 4.8,
        "Food cost %": 40.0,
        "Tempo di preparazione": "5 min",
        "Popolarità prevista": "Media",
        Storytelling:
          "Insalata fresca con il caratteristico dressing piccante allo zenzero.",
        Qty: 0,
      },
      // Aggiungo più items per simulare un menu completo
      {
        id: 7,
        "Fascia oraria": "All day",
        Item: "Kombucha Zenzero & Limone",
        Categoria: "Carita Morena",
        "Sub-Categoria": "Bevande fermentate",
        "Prezzo di vendita": 4.5,
        "Costo unitario": 1.0,
        "Margine lordo": 3.5,
        "Food cost %": 22.2,
        "Popolarità prevista": "Alta",
        Storytelling:
          "Bevanda fermentata naturale con probiotici, zenzero fresco e limone.",
      },
      {
        id: 8,
        "Fascia oraria": "Pranzo",
        Item: "Focaccia con verdure grigliate",
        Categoria: "Classic",
        "Sub-Categoria": "Focacce",
        "Prezzo di vendita": 7.5,
        "Costo unitario": 2.8,
        "Margine lordo": 4.7,
        "Food cost %": 37.3,
        "Popolarità prevista": "Alta",
        Storytelling:
          "Focaccia croccante con verdure grigliate fresche di stagione.",
      },
      {
        id: 9,
        "Fascia oraria": "All day",
        Item: "Acqua naturale",
        Categoria: "Classic",
        "Sub-Categoria": "Bevande",
        "Prezzo di vendita": 1.0,
        "Costo unitario": 0.2,
        "Margine lordo": 0.8,
        "Food cost %": 20.0,
        "Popolarità prevista": "Alta",
        Storytelling: "Acqua sempre disponibile, naturale e frizzante.",
      },
      {
        id: 10,
        "Fascia oraria": "Cena",
        Item: "Birra artigianale locale",
        Categoria: "Classic",
        "Sub-Categoria": "Alcolici",
        "Prezzo di vendita": 5.0,
        "Costo unitario": 2.0,
        "Margine lordo": 3.0,
        "Food cost %": 40.0,
        "Popolarità prevista": "Media",
        Storytelling: "Selezione di birre artigianali del territorio.",
      },
    ];
  };

  // Carica i dati demo e (solo se disponibile) Excel
  useEffect(() => {
    // 1️⃣ Carica subito i dati demo
    //const demoData = generateDemoData();
    //setMenuItems(demoData);
    //setFilteredItems(demoData);

    // 2️⃣ Solo se window.fs esiste (non in CodeSandbox)
    if (window.fs && typeof window.fs.readFile === "function") {
      loadMenuData();
    }
  }, []);

  // Filtraggio items
  useEffect(() => {
    let filtered = menuItems;

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.Categoria === selectedCategory);
    }

    if (selectedFasciaOraria) {
      filtered = filtered.filter(
        (item) => item["Fascia oraria"] === selectedFasciaOraria
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.Item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Ingredienti principali"]
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, selectedFasciaOraria, searchTerm]);

  // Calcoli per le metriche
  const metrics = useMemo(() => {
    const totalItems = menuItems.length;
    const itemsWithPrice = menuItems.filter(
      (item) => item["Prezzo di vendita"] > 0
    );
    const avgPrice =
      itemsWithPrice.length > 0
        ? itemsWithPrice.reduce(
            (sum, item) => sum + item["Prezzo di vendita"],
            0
          ) / itemsWithPrice.length
        : 0;

    const itemsWithCost = menuItems.filter(
      (item) => item["Costo unitario"] > 0
    );
    const avgFoodCost =
      itemsWithCost.length > 0
        ? itemsWithCost.reduce(
            (sum, item) => sum + (item["Food cost %"] || 0),
            0
          ) / itemsWithCost.length
        : 0;

    const categoriesCount = [
      ...new Set(menuItems.map((item) => item.Categoria).filter(Boolean)),
    ].length;

    return { totalItems, avgPrice, avgFoodCost, categoriesCount };
  }, [menuItems]);

  // Dati per categoria
  const categoryData = useMemo(() => {
    const categories = {};
    menuItems.forEach((item) => {
      if (item.Categoria) {
        if (!categories[item.Categoria]) {
          categories[item.Categoria] = { count: 0, items: [] };
        }
        categories[item.Categoria].count++;
        categories[item.Categoria].items.push(item);
      }
    });
    return categories;
  }, [menuItems]);

  // Funzioni per editing
  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      // Calcola margine e food cost
      const prezzo = parseFloat(editingItem["Prezzo di vendita"]) || 0;
      const costo = parseFloat(editingItem["Costo unitario"]) || 0;

      const updatedItem = {
        ...editingItem,
        "Prezzo di vendita": prezzo,
        "Costo unitario": costo,
        "Margine lordo": prezzo - costo,
        "Food cost %": prezzo > 0 ? (costo / prezzo) * 100 : 0,
      };

      setMenuItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      setEditingItem(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Funzione per aggiungere nuovo item
  const handleAddNewItem = (newItem) => {
    const id = Math.max(...menuItems.map((item) => item.id), 0) + 1;
    const prezzo = parseFloat(newItem["Prezzo di vendita"]) || 0;
    const costo = parseFloat(newItem["Costo unitario"]) || 0;

    const itemToAdd = {
      ...newItem,
      id,
      "Prezzo di vendita": prezzo,
      "Costo unitario": costo,
      "Margine lordo": prezzo - costo,
      "Food cost %": prezzo > 0 ? (costo / prezzo) * 100 : 0,
    };

    setMenuItems((prev) => [...prev, itemToAdd]);
    setShowAddForm(false);
  };

  // Componente per form di editing
  const EditForm = ({ item, onSave, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Modifica Item</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome Item</label>
            <input
              type="text"
              value={item.Item || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({ ...prev, Item: e.target.value }))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              value={item.Categoria || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  Categoria: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Seleziona categoria</option>
              <option value="Linea Z">Linea Z</option>
              <option value="Classic">Classic</option>
              <option value="Carita Morena">Carita Morena</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Fascia Oraria
            </label>
            <select
              value={item["Fascia oraria"] || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  "Fascia oraria": e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Seleziona fascia</option>
              <option value="Colazione">Colazione</option>
              <option value="Pranzo">Pranzo</option>
              <option value="Cena">Cena</option>
              <option value="All day">All day</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Prezzo di Vendita (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={item["Prezzo di vendita"] || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  "Prezzo di vendita": e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Costo Unitario (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={item["Costo unitario"] || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  "Costo unitario": e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tempo Preparazione
            </label>
            <input
              type="text"
              value={item["Tempo di preparazione"] || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  "Tempo di preparazione": e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Popolarità Prevista
            </label>
            <select
              value={item["Popolarità prevista"] || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  "Popolarità prevista": e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Seleziona</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Bassa">Bassa</option>
            </select>
          </div>
          {/* Ingredienti Principali */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Ingredienti Principali
            </label>
            <textarea
              value={item["Ingredienti principali"] || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  "Ingredienti principali": e.target.value,
                }))
              }
              className="w-full p-2 border rounded h-20"
            />
          </div>
          {/* Storytelling */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Storytelling
            </label>
            <textarea
              value={item.Storytelling || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  Storytelling: e.target.value,
                }))
              }
              className="w-full p-2 border rounded h-24"
            />
          </div>
          {/* Impronta Idrica */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Impronta Idrica
            </label>
            <input
              type="text"
              value={item["Impronta idrica"] || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  "Impronta idrica": e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          {/* Impronta Carbonica */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Impronta Carbonica
            </label>
            <input
              type="text"
              value={item["Impronta carbonica"] || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  "Impronta carbonica": e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          {/* Foto */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Foto (URL o nome file)
            </label>
            <input
              type="text"
              value={item.Foto || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  Foto: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
              placeholder="https://..."
            />
          </div>
        </div>
        {/* Calcoli automatici */}
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Margine Lordo:</span>
              <span className="ml-2 text-green-600">
                €
                {(
                  (parseFloat(item["Prezzo di vendita"]) || 0) -
                  (parseFloat(item["Costo unitario"]) || 0)
                ).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="font-medium">Food Cost %:</span>
              <span className="ml-2 text-blue-600">
                {parseFloat(item["Prezzo di vendita"]) > 0
                  ? (
                      ((parseFloat(item["Costo unitario"]) || 0) /
                        parseFloat(item["Prezzo di vendita"])) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div>
              <span className="font-medium">Margine %:</span>
              <span className="ml-2 text-purple-600">
                {parseFloat(item["Prezzo di vendita"]) > 0
                  ? (
                      (((parseFloat(item["Prezzo di vendita"]) || 0) -
                        (parseFloat(item["Costo unitario"]) || 0)) /
                        parseFloat(item["Prezzo di vendita"])) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Save size={16} className="mr-1" />
            Salva
          </button>
        </div>
      </div>
    </div>
  );

  console.log("🚀 Dashboard ha questi menuItems:", menuItems);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zenzo Bar</h1>
              <p className="text-gray-600">Menu Engineering Dashboard</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Aggiungi Item
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              📤 Carica CSV
            </button>

            <button
              type="button"
              onClick={() => {
                const jsonData = JSON.stringify(menuItems, null, 2);

                // 1️⃣ Salva su localStorage
                localStorage.setItem("menuItems", jsonData);

                // 2️⃣ Salva su Glitch
                fetch(
                  "https://troubled-neighborly-petalite.glitch.me/api/save-json",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: jsonData,
                  }
                )
                  .then((res) => res.json())
                  .then((data) => {
                    console.log("✅ JSON salvato su Glitch:", data);
                  })
                  .catch((err) => {
                    console.error(
                      "❌ Errore durante il salvataggio su Glitch:",
                      err
                    );
                  });

                // 3️⃣ Scarica localmente
                const blob = new Blob([jsonData], { type: "application/json" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "menu.json";
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }, 0);
              }}
              className="ml-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
            >
              📥 Esporta JSON
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", label: "Panoramica", icon: BarChart3 },
              { id: "menu", label: "Gestione Menu", icon: Edit3 },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenuto Tabs */}
        {activeTab === "overview" && (
          <div className="py-6">
            {/* Metriche principali */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 size={16} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Totale Items
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {metrics.totalItems}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign size={16} className="text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Prezzo Medio
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      €{metrics.avgPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertCircle size={16} className="text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Food Cost Medio
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {metrics.avgFoodCost.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Categorie
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {metrics.categoriesCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribuzione per categoria */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Distribuzione per Categoria
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(categoryData).map(([category, data]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {category}
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 mb-1">
                      {data.count}
                    </p>
                    <p className="text-sm text-gray-500">items nel menu</p>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (data.count / metrics.totalItems) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {((data.count / metrics.totalItems) * 100).toFixed(1)}%
                        del totale
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="py-6">
            {/* Filtri */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Cerca items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Tutte le categorie</option>
                  <option value="Linea Z">Linea Z</option>
                  <option value="Classic">Classic</option>
                  <option value="Carita Morena">Carita Morena</option>
                </select>

                <select
                  value={selectedFasciaOraria}
                  onChange={(e) => setSelectedFasciaOraria(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Tutte le fasce orarie</option>
                  <option value="Colazione">Colazione</option>
                  <option value="Pranzo">Pranzo</option>
                  <option value="Cena">Cena</option>
                  <option value="All day">All day</option>
                </select>

                <div className="flex items-center text-sm text-gray-600">
                  <Filter size={16} className="mr-2" />
                  {filteredItems.length} di {menuItems.length} items
                </div>
              </div>
            </div>

            {/* Lista Items */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fascia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prezzo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Costo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Margine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Food Cost %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Popolarità
                      </th>

                      {/* ─── NUOVI CAMPI ─── */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingredienti
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Storytelling
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impr. Idrica
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impr. Carbonica
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Foto
                      </th>
                      {/* ──────────────────── */}

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.Item}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.Categoria === "Linea Z"
                                ? "bg-purple-100 text-purple-800"
                                : item.Categoria === "Classic"
                                ? "bg-blue-100 text-blue-800"
                                : item.Categoria === "Carita Morena"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.Categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item["Fascia oraria"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item["Prezzo di vendita"] > 0
                            ? `€${item["Prezzo di vendita"].toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item["Costo unitario"] > 0
                            ? `€${item["Costo unitario"].toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item["Prezzo di vendita"] > 0 &&
                          item["Costo unitario"] > 0 ? (
                            <span
                              className={`font-medium ${
                                item["Margine lordo"] > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              €{item["Margine lordo"].toFixed(2)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item["Food cost %"] > 0 ? (
                            <span
                              className={`font-medium ${
                                item["Food cost %"] <= 30
                                  ? "text-green-600"
                                  : item["Food cost %"] <= 40
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {item["Food cost %"].toFixed(1)}%
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item["Popolarità prevista"] === "Alta"
                                ? "bg-green-100 text-green-800"
                                : item["Popolarità prevista"] === "Media"
                                ? "bg-yellow-100 text-yellow-800"
                                : item["Popolarità prevista"] === "Bassa"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item["Popolarità prevista"] || "Non definita"}
                          </span>
                        </td>

                        {/* --- NUOVI CAMPI --- */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item["Ingredienti principali"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.Storytelling}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item["Impronta idrica"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item["Impronta carbonica"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {/* Mostra link/immagine se Foto è una URL, altrimenti testo */}
                          {item.Foto ? (
                            item.Foto.startsWith("http") ? (
                              <img
                                src={item.Foto}
                                alt="foto"
                                className="h-10 w-10 object-cover rounded"
                              />
                            ) : (
                              item.Foto
                            )
                          ) : (
                            "-"
                          )}
                        </td>
                        {/* --- FINE NUOVI CAMPI --- */}

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Edit3 size={16} className="mr-1" />
                            Modifica
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="py-6">
            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Food Cost Analysis */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Analisi Food Cost
                </h3>
                <div className="space-y-4">
                  {Object.entries(categoryData).map(([category, data]) => {
                    const itemsWithCost = data.items.filter(
                      (item) => item["Food cost %"] > 0
                    );
                    const avgFoodCost =
                      itemsWithCost.length > 0
                        ? itemsWithCost.reduce(
                            (sum, item) => sum + item["Food cost %"],
                            0
                          ) / itemsWithCost.length
                        : 0;

                    return (
                      <div
                        key={category}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <span className="font-medium">{category}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {itemsWithCost.length} items con costo
                          </span>
                          <span
                            className={`font-semibold ${
                              avgFoodCost <= 30
                                ? "text-green-600"
                                : avgFoodCost <= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {avgFoodCost.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items senza prezzi */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Items da Completare
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="text-sm font-medium">
                      Senza prezzo di vendita
                    </span>
                    <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                      {
                        menuItems.filter(
                          (item) => item["Prezzo di vendita"] <= 0
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="text-sm font-medium">
                      Senza costo unitario
                    </span>
                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                      {
                        menuItems.filter((item) => item["Costo unitario"] <= 0)
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">
                      Completi (prezzo + costo)
                    </span>
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                      {
                        menuItems.filter(
                          (item) =>
                            item["Prezzo di vendita"] > 0 &&
                            item["Costo unitario"] > 0
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top performers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Top Performers (per margine)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-left py-2">Categoria</th>
                      <th className="text-left py-2">Margine €</th>
                      <th className="text-left py-2">Margine %</th>
                      <th className="text-left py-2">Food Cost %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems
                      .filter(
                        (item) =>
                          item["Prezzo di vendita"] > 0 &&
                          item["Costo unitario"] > 0
                      )
                      .sort((a, b) => b["Margine lordo"] - a["Margine lordo"])
                      .slice(0, 10)
                      .map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 text-sm">{item.Item}</td>
                          <td className="py-2 text-sm">{item.Categoria}</td>
                          <td className="py-2 text-sm font-medium text-green-600">
                            €{item["Margine lordo"].toFixed(2)}
                          </td>
                          <td className="py-2 text-sm">
                            {(
                              (item["Margine lordo"] /
                                item["Prezzo di vendita"]) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                          <td className="py-2 text-sm">
                            {item["Food cost %"].toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form di editing */}
      {editingItem && (
        <EditForm
          item={editingItem}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Form per aggiungere nuovo item */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Aggiungi Nuovo Item</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newItem = Object.fromEntries(formData.entries());
                handleAddNewItem(newItem);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome Item
                  </label>
                  <input
                    type="text"
                    name="Item"
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categoria
                  </label>
                  <select
                    name="Categoria"
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleziona categoria</option>
                    <option value="Linea Z">Linea Z</option>
                    <option value="Classic">Classic</option>
                    <option value="Carita Morena">Carita Morena</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fascia Oraria
                  </label>
                  <select
                    name="Fascia oraria"
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleziona fascia</option>
                    <option value="Colazione">Colazione</option>
                    <option value="Pranzo">Pranzo</option>
                    <option value="Cena">Cena</option>
                    <option value="All day">All day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prezzo di Vendita (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Prezzo di vendita"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Costo Unitario (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Costo unitario"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tempo Preparazione
                  </label>
                  <input
                    type="text"
                    name="Tempo di preparazione"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Popolarità Prevista
                  </label>
                  <select
                    name="Popolarità prevista"
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleziona</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Bassa">Bassa</option>
                  </select>
                </div>
                {/* Ingredienti Principali */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Ingredienti Principali
                  </label>
                  <textarea
                    name="Ingredienti principali"
                    className="w-full p-2 border rounded h-20"
                  />
                </div>
                {/* Storytelling */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Storytelling
                  </label>
                  <textarea
                    name="Storytelling"
                    className="w-full p-2 border rounded h-24"
                  />
                </div>
                {/* Impronta Idrica */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Impronta Idrica
                  </label>
                  <input
                    type="text"
                    name="Impronta idrica"
                    className="w-full p-2 border rounded"
                  />
                </div>
                {/* Impronta Carbonica */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Impronta Carbonica
                  </label>
                  <input
                    type="text"
                    name="Impronta carbonica"
                    className="w-full p-2 border rounded"
                  />
                </div>
                {/* Foto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Foto (URL o nome file)
                  </label>
                  <input
                    type="text"
                    name="Foto"
                    className="w-full p-2 border rounded"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Aggiungi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form di upload CSV */}
      {showUpload && (
        <UploadForm
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default ZenzoMenuDashboard;
