// src/components/RangeChecker.jsx
import React, { useState } from "react";
import "../App.css";

// const backendURL = "http://localhost:7000";
const backendURL = "http://192.168.2.88:7000";

const RangeChecker = () => {
  const [startRange, setStartRange] = useState("");
  const [endRange, setEndRange] = useState("");
  const [missing, setMissing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkMissing = async () => {
    if (!startRange || !endRange) {
      setError("נא להזין טווחים מלאים");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${backendURL}/api/checkMissing?start=${startRange}&end=${endRange}`
      );
      const data = await res.json();

      if (res.ok) setMissing(data.missing || []);
      else setError(data.error || "שגיאה בבדיקת הטווחים");
    } catch {
      setError("שגיאה בבדיקת הטווחים");
    }

    setLoading(false);
  };

  return (
    <div className="section">
      <h2>📋 בדיקת טווחים חסרים</h2>
      <div className="search-card">
        <div className="search-container" style={{ direction: "rtl" }}>
          <input
            type="number"
            placeholder="מספר התחלה"
            value={startRange}
            onChange={(e) => setStartRange(e.target.value)}
          />
          <input
            type="number"
            placeholder="מספר סיום"
            value={endRange}
            onChange={(e) => setEndRange(e.target.value)}
          />
          <button onClick={checkMissing}>בדוק</button>
        </div>
      </div>

      {loading && <p>בודק...</p>}
      {error && <p className="error-message">{error}</p>}

      {missing.length > 0 && (
        <div className="missing-results">
          <h4>תעודות חסרות:</h4>
          <p>{missing.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default RangeChecker;
