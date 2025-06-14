import "./index.css"; // ⚡ Importa subito i CSS di Tailwind!
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ZenzoMenuDashboard from "./ZenzoMenuDashboard";
import Layout from "./Layout";
import UserMenu from "./UserMenu"; // DECOMMENTA QUESTA RIGA!

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<ZenzoMenuDashboard />} />
          <Route path="/menu" element={<UserMenu />} />{" "}
          {/* DECOMMENTA QUESTA */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
