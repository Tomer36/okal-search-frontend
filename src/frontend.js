import React, { useState, useEffect, useCallback } from "react";
import "./App.css"; // Import the integrated styles
import searchIcon from "../src/assests/search.png";

const backendURL = "http://localhost:5000";

const PhotoSearch = () => {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [notification, setNotification] = useState("");

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${backendURL}/api/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (response.ok) {
        setPhotos(data.photos);
      } else {
        setError(data.error || "Error retrieving photos");
      }
    } catch (err) {
      console.error("Error searching photos:", err);
      setError("Error searching photos");
    }
    setLoading(false);
  }, [query]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (query.trim() !== "") {
        performSearch();
      } else {
        setPhotos([]);
        setError("");
      }
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [query, performSearch]);

  const handlePrintImage = () => {
    if (!selectedPhoto) {
      console.error("No photo selected for printing!");
      return;
    }
  
    // Open a new window for printing
    const printWindow = window.open("", "_blank");
  
    // Write the full HTML document inside the new window
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <img src="${selectedPhoto}" alt="Print View" />
        </body>
      </html>
    `);
  
    printWindow.document.close();
  
    // Prevent the window from closing too soon
    const mediaQueryList = printWindow.matchMedia("print");
  
    mediaQueryList.addEventListener("change", (e) => {
      if (!e.matches) {
        // Print dialog has closed
        printWindow.close();
      }
    });
  
    printWindow.print();
  };
  

  return (
    <div className="App">
      <div className="taskbar">
        <div className="actions">
          {/* Removed "Print" button outside the modal */}
        </div>
      </div>

      {notification && <div className="notification">{notification}</div>}

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search photos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

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

      {selectedPhoto && (
        <div className="photo-viewer" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-viewer-content">
            <img src={selectedPhoto} alt="Full view" className="large-photo" />
            <button className="print-button" onClick={handlePrintImage}>
              🖨️ Print Image
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© 2025 Photo Search. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PhotoSearch;
