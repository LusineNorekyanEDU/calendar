// src/App.jsx
import React, { useState } from "react";
import Calendar from "./components/Calendar";
import CategoriesPage from "./components/Categories";
import "./global.css";

function App() {
  const [route, setRoute] = useState("calendar"); // "calendar" | "categories"

  return (
    <div className="app-root">
      <header style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <h1 className="title" style={{ margin: 0 }}>Monthly Planner</h1>
        <nav style={{ marginLeft: "auto" }}>
          <button onClick={() => setRoute("calendar")} style={{ marginRight: 8 }}>Calendar</button>
          <button onClick={() => setRoute("categories")}>Categories</button>
        </nav>
      </header>

      <main>
        {route === "calendar" && <Calendar />}
        {route === "categories" && <CategoriesPage />}
      </main>
    </div>
  );
}

export default App;
