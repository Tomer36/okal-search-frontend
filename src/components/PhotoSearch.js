import React, { useState, useEffect, useCallback } from "react";
import "../App.css";
import searchIcon from "../assests/search.png";

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
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${backendURL}/api/search?query=${encodeURIComponent(query)}`;

      if (minRange !== "" && maxRange !== "") {
        url += `&min=${encodeURIComponent(minRange)}&max=${encodeURIComponent(
          maxRange
        )}`;
      }

      if (startDate !== "" && endDate !== "") {
        url += `&startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) setPhotos(data.photos);
      else setError(data.error || "שגיאה בקבלת התעודות");
    } catch (err) {
      console.error("Error searching photos:", err);
      setError("שגיאה בקבלת התעודות");
    }
    setLoading(false);
  }, [query, minRange, maxRange, startDate, endDate]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (
        query.trim() !== "" ||
        (minRange !== "" && maxRange !== "") ||
        (startDate !== "" && endDate !== "")
      ) {
        performSearch();
      } else {
        setPhotos([]);
        setError("");
      }
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [query, minRange, maxRange, startDate, endDate, performSearch]);

  const handlePrintImage = () => {
    if (!selectedPhoto) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Okal</title>
          <style>
            @media print {
              .print-photo-card { page-break-after: always; }
              .print-photo-card:last-child { page-break-after: auto; }
            }
            body { font-family: Arial; text-align: center; background-color: white; padding: 20px; margin: 0; }
            img { max-width: 90%; max-height: 90vh; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
          </style>
        </head>
        <body>
          <img id="print-img" src="${selectedPhoto}" alt="Print View" />
        </body>
      </html>
    `);
    printWindow.document.close();
    const img = printWindow.document.getElementById("print-img");
    img.onload = () => printWindow.print();
  };

  const handlePrintAll = () => {
    if (photos.length === 0) return;
    const printWindow = window.open("", "_blank");
    const imagesHtml = photos
      .map(
        (photo, index) =>
          `<div class="print-photo-card">
             <img id="print-img-${index}" src="${backendURL}/${photo}" alt="${photo}" />
           </div>`
      )
      .join("");
    printWindow.document.write(`
      <html>
        <head>
          <title>Okal</title>
          <style>
            @media print {
              .print-photo-card { page-break-after: always; }
              .print-photo-card:last-child { page-break-after: auto; }
            }
            body { font-family: Arial; text-align: center; background-color: white; padding: 20px; margin: 0; }
            img { max-width: 90%; max-height: 90vh; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
          </style>
        </head>
        <body>${imagesHtml}</body>
      </html>
    `);
    printWindow.document.close();
    const images = printWindow.document.querySelectorAll("img");
    let loadedCount = 0;
    images.forEach((img) => {
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) printWindow.print();
      };
    });
  };

  const handleResetSearch = () => {
    setQuery("");
    setMinRange("");
    setMaxRange("");
    setStartDate("");
    setEndDate("");
    setPhotos([]);
    setError("");
  };

  const handlePreviousPhoto = (e) => {
    e.stopPropagation();
    if (selectedPhotoIndex > 0) {
      const newIndex = selectedPhotoIndex - 1;
      setSelectedPhoto(`${backendURL}/${photos[newIndex]}`);
      setSelectedPhotoIndex(newIndex);
    }
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (selectedPhotoIndex < photos.length - 1) {
      const newIndex = selectedPhotoIndex + 1;
      setSelectedPhoto(`${backendURL}/${photos[newIndex]}`);
      setSelectedPhotoIndex(newIndex);
    }
  };

  return (
    <div className="section">
        <h2>🔍 חיפוש תעודות</h2>
      {/* Search options card */}
      <div className="search-card">
        <div
          className="search-container"
          style={{ direction: "rtl", textAlign: "right" }}
        >
          <div>
            <label htmlFor="textSearch">חיפוש חופשי:</label>
            <input
              id="textSearch"
              type="text"
              placeholder="🔍 חפש תעודה..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div>
            <label htmlFor="minRange">טווח התחלה:</label>
            <input
              id="minRange"
              type="number"
              placeholder="מ.."
              value={minRange}
              onChange={(e) => setMinRange(e.target.value)}
              className="range-input"
            />
          </div>

          <div>
            <label htmlFor="maxRange">טווח סיום:</label>
            <input
              id="maxRange"
              type="number"
              placeholder="ל.."
              value={maxRange}
              onChange={(e) => setMaxRange(e.target.value)}
              className="range-input"
            />
          </div>

          <div>
            <label htmlFor="startDate">תאריך התחלה:</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div>
            <label htmlFor="endDate">תאריך סיום:</label>
            <input
              id="endDate"
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
          {photos.length > 0 && (
            <button className="print-all-button" onClick={handlePrintAll}>
              🖨️ הדפס הכל
            </button>
          )}
          <button className="reset-button" onClick={handleResetSearch}>
            איפוס חיפוש
          </button>
        </div>
      </div>

      {loading && <span className="loading-message">⏳ טוען...</span>}
      {error && <span className="error-message">❌ {error}</span>}

      {!loading &&
        photos.length === 0 &&
        (query.trim() !== "" ||
          (minRange !== "" && maxRange !== "") ||
          (startDate !== "" && endDate !== "")) && (
          <p className="no-results">לא נמצאו תוצאות</p>
        )}

      <div className="photo-list">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="photo-card"
            onClick={() => setSelectedPhoto(`${backendURL}/${photo}`)}
          >
            <img
              src={`${backendURL}/${photo}`}
              alt="icon"
              className="photo-icon"
            />
            <p className="photo-name">{photo.replace(/\.[^/.]+$/, "")}</p>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="photo-viewer" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-viewer-content">
            <button
              className="nav-arrow left"
              onClick={handlePreviousPhoto}
              disabled={photos.length <= 1 || selectedPhotoIndex === 0}
            >
              ◀
            </button>
            <div className="photo-image-container">
              <img
                src={selectedPhoto}
                alt="Full view"
                className="large-photo"
              />
            </div>
            <button
              className="nav-arrow right"
              onClick={handleNextPhoto}
              disabled={
                photos.length <= 1 || selectedPhotoIndex === photos.length - 1
              }
            >
              ▶
            </button>
            <div className="button-container">
              <button className="print-button" onClick={handlePrintImage}>
                🖨️ הדפס
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoSearch;
