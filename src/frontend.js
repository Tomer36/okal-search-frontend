import React, { useState, useEffect, useCallback } from "react";
import "./App.css"; // Import the integrated styles
import searchIcon from "../src/assests/search.png";

const backendURL = "http://localhost:7000";

const PhotoSearch = () => {
  // New states for the date range filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [query, setQuery] = useState("");
  const [minRange, setMinRange] = useState("");
  const [maxRange, setMaxRange] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [notification, setNotification] = useState("");

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Build the search URL with query parameters.
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
      if (response.ok) {
        setPhotos(data.photos);
      } else {
        setError(data.error || "שגיאה בקבלת התעודות");
      }
    } catch (err) {
      console.error("Error searching photos:", err);
      setError("שגיאה בקבלת התעודות");
    }
    setLoading(false);
  }, [query, minRange, maxRange, startDate, endDate]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      // Perform search if any filter is provided
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
    if (!selectedPhoto) {
      console.error("No photo selected for printing!");
      return;
    }
    // Open a new window for printing the single selected image.
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Okal</title>
           <style>
            @media print {
              .print-photo-card {
                page-break-after: always;
                page-break-inside: avoid;
              }
              .print-photo-card:last-child {
                page-break-after: auto;
              }
            }
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              background-color: white;
              padding: 20px;
              margin: 0;
            }
            .print-container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .print-photo-card {
              margin-bottom: 20px;
            }
            img {
              max-width: 90%;
              max-height: 90vh;
              border-radius: 10px;
              box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <img src="${selectedPhoto}" alt="Print View" />
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    const mediaQueryList = printWindow.matchMedia("print");
    mediaQueryList.addEventListener("change", (e) => {
      if (!e.matches) {
        printWindow.close();
      }
    });
    printWindow.print();
  };

  // New function: Print all photos, each on its own page.
  const handlePrintAll = () => {
    if (photos.length === 0) {
      console.error("אין תעודות להדפסה!");
      return;
    }

    const printWindow = window.open("", "_blank");

    // Create HTML string for all photos. Each photo is wrapped in a container that enforces a page break.
    const imagesHtml = photos
      .map(
        (photo) =>
          `<div class="print-photo-card">
             <img src="${backendURL}/${photo}" alt="${photo}" />
           </div>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Okal</title>
          <style>
            @media print {
              .print-photo-card {
                page-break-after: always;
                page-break-inside: avoid;
              }
              .print-photo-card:last-child {
                page-break-after: auto;
              }
            }
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              background-color: white;
              padding: 20px;
              margin: 0;
            }
            .print-container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .print-photo-card {
              margin-bottom: 20px;
            }
            img {
              max-width: 90%;
              max-height: 90vh;
              border-radius: 10px;
              box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${imagesHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    const mediaQueryList = printWindow.matchMedia("print");
    mediaQueryList.addEventListener("change", (e) => {
      if (!e.matches) {
        printWindow.close();
      }
    });
    printWindow.print();
  };

  return (
    <div className="App">
      <div className="taskbar">
        <div className="actions">
          <div className="info">
            <h1>🔍 חיפוש תעודות</h1>
          </div>
        </div>
      </div>

      {notification && <div className="notification">{notification}</div>}

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
            <label htmlFor="minRange">טווח אתחלה:</label>
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

      {loading && <p className="loading-message">טוען...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* No results found message */}
      {!loading &&
        photos.length === 0 &&
        (query.trim() !== "" ||
          (minRange !== "" && maxRange !== "") ||
          (startDate !== "" && endDate !== "")) && (
          <p className="no-results">לא נמצאו תוצאות</p>
        )}

      <div className="photo-list">
        {photos.map((photo, index) => (
          <div key={index} className="photo-card">
            <img
              src={searchIcon}
              alt="icon"
              className="photo-icon"
              onClick={() => setSelectedPhoto(`${backendURL}/${photo}`)}
            />
            <p className="photo-name">{photo}</p>
          </div>
        ))}
      </div>
      {/* Print All Button */}
      {photos.length > 0 && (
        <div className="print-all-container">
          <button className="print-all-button" onClick={handlePrintAll}>
            🖨️ הדפס הכל
          </button>
        </div>
      )}

      {selectedPhoto && (
        <div className="photo-viewer" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-viewer-content">
            <div className="photo-image-container">
              <img
                src={selectedPhoto}
                alt="Full view"
                className="large-photo"
              />
            </div>
            <div className="button-container">
              <button className="print-button" onClick={handlePrintImage}>
                🖨️ הדפס
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© 2025 חיפוש תעודות. כל הזכויות שמורות.</p>
      </footer>
    </div>
  );
};

export default PhotoSearch;
