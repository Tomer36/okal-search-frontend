import React, { useState, useEffect, useCallback } from "react";
import "../App.css";

// const backendURL = "http://localhost:7000";
const backendURL = "http://192.168.2.88:7000";


const PhotoSearch = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [query, setQuery] = useState("");
  const [minRange, setMinRange] = useState("");
  const [maxRange, setMaxRange] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Load saved state
  useEffect(() => {
    const saved = localStorage.getItem("photoSearchState");
    if (saved) {
      const parsed = JSON.parse(saved);
      setStartDate(parsed.startDate || "");
      setEndDate(parsed.endDate || "");
      setQuery(parsed.query || "");
      setMinRange(parsed.minRange || "");
      setMaxRange(parsed.maxRange || "");
      setPhotos(parsed.photos || []);
    }
  }, []);

  // ✅ Save every state change
  useEffect(() => {
    const state = { startDate, endDate, query, minRange, maxRange, photos };
    localStorage.setItem("photoSearchState", JSON.stringify(state));
  }, [startDate, endDate, query, minRange, maxRange, photos]);

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${backendURL}/api/search?query=${encodeURIComponent(query)}`;
      if (minRange && maxRange) url += `&min=${minRange}&max=${maxRange}`;
      if (startDate && endDate)
        url += `&startDate=${startDate}&endDate=${endDate}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setPhotos(data.photos);
      else setError(data.error || "שגיאה בקבלת התעודות");
    } catch {
      setError("שגיאה בקבלת התעודות");
    }
    setLoading(false);
  }, [query, minRange, maxRange, startDate, endDate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query || (minRange && maxRange) || (startDate && endDate))
        performSearch();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [query, minRange, maxRange, startDate, endDate, performSearch]);

  const handleReset = () => {
    setQuery("");
    setMinRange("");
    setMaxRange("");
    setStartDate("");
    setEndDate("");
    setPhotos([]);
    localStorage.removeItem("photoSearchState");
  };

  return (
    <div className="section">
      <h2>🔍 חיפוש תעודות</h2>
      <div className="search-card">
        <div
          className="search-container"
          style={{ direction: "rtl", textAlign: "right" }}
        >
          <div>
            <label>חיפוש חופשי:</label>
            <input
              type="text"
              placeholder="🔍 חפש תעודה..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div>
            <label>טווח התחלה:</label>
            <input
              type="number"
              value={minRange}
              onChange={(e) => setMinRange(e.target.value)}
              className="range-input"
            />
          </div>
          <div>
            <label>טווח סיום:</label>
            <input
              type="number"
              value={maxRange}
              onChange={(e) => setMaxRange(e.target.value)}
              className="range-input"
            />
          </div>
          <div>
            <label>תאריך התחלה:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div>
            <label>תאריך סיום:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      </div>

      <div className="result-bar">
        <div className="search-summary">
          נמצאו <strong>{photos.length}</strong> תוצאות
        </div>
        <div className="result-actions">
          <button className="reset-button" onClick={handleReset}>
            איפוס
          </button>
        </div>
      </div>

      {loading && <p>⏳ טוען...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="photo-list">
        {photos.map((photo, i) => (
          <div key={i} className="photo-card">
            <img
              src={`${backendURL}/${photo}`}
              alt={photo}
              className="photo-icon"
            />
            <p>{photo}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoSearch;
