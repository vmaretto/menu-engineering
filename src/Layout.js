import React, { useState, useEffect, createContext } from "react";

// Crea il contesto da usare in tutta l'app
export const MenuContext = createContext();

export default function Layout({ children }) {
  // 1️⃣ Recupera i dati salvati su localStorage (se ci sono)
  const [menuItems, setMenuItems] = useState(() => {
    const stored = localStorage.getItem("menuItems");
    return stored ? JSON.parse(stored) : [];
  });

  // 2️⃣ Ogni volta che menuItems cambia, salvalo su localStorage
  useEffect(() => {
    localStorage.setItem("menuItems", JSON.stringify(menuItems));
  }, [menuItems]);

  return (
    <MenuContext.Provider value={{ menuItems, setMenuItems }}>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </MenuContext.Provider>
  );
}
