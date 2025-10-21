import React, { useState } from "react";
import Header from "./components/Header";
import PhotoSearch from "./components/PhotoSearch";
import RangeChecker from "./components/RangeChecker";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("search"); // "search" | "range"

  return (
    <div className="App">
      <Header />

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-button ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          🔍 חיפוש תעודות
        </button>
        <button
          className={`tab-button ${activeTab === "range" ? "active" : ""}`}
          onClick={() => setActiveTab("range")}
        >
          📋 בדיקת טווחים חסרים
        </button>
      </div>

      {/* Render Active Tab */}
      <div className="tab-content">
        {activeTab === "search" && <PhotoSearch />}
        {activeTab === "range" && <RangeChecker />}
      </div>

      <Footer />
    </div>
  );
}

export default App;
