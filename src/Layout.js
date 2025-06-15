import React, { useState, useEffect, createContext } from "react";

export const MenuContext = createContext();

export default function Layout({ children }) {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuFromBackend = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/menu`);
        const json = await res.json();
        if (Array.isArray(json)) {
          setMenuItems(json);
        }
      } catch (err) {
        console.error("Errore nel fetch del menu da Glitch:", err);
      }
    };

    fetchMenuFromBackend();
  }, []);

  useEffect(() => {
    localStorage.setItem("menuItems", JSON.stringify(menuItems));
  }, [menuItems]);

  return (
    <MenuContext.Provider value={{ menuItems, setMenuItems }}>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </MenuContext.Provider>
  );
}
