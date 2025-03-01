import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Configurator from "./pages/Configurator";
import About from "./pages/About";
import AccessibilityPanel, {
  ColorBlindMode,
} from "./components/AccessibilityPanel";

function App() {
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlindMode, setColorBlindMode] =
    useState<ColorBlindMode>("normal");

  // Appliquer les paramètres d'accessibilité
  useEffect(() => {
    // Appliquer la taille de la police
    document.documentElement.style.fontSize = `${fontSize}%`;

    // Appliquer le contraste élevé
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Appliquer le mode daltonien
    document.documentElement.setAttribute(
      "data-color-blind-mode",
      colorBlindMode
    );

    // Ajouter les styles CSS pour le mode daltonien
    const existingStyle = document.getElementById("color-blind-styles");
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }

    if (colorBlindMode !== "normal") {
      const style = document.createElement("style");
      style.id = "color-blind-styles";

      // Définir les filtres CSS pour chaque mode daltonien
      const filters: Record<ColorBlindMode, string> = {
        normal: "none",
        protanopia: "url(#protanopia-filter)",
        deuteranopia: "url(#deuteranopia-filter)",
        tritanopia: "url(#tritanopia-filter)",
        achromatopsia: "grayscale(100%)",
      };

      style.textContent = `
        body {
          filter: ${filters[colorBlindMode]};
        }
      `;

      document.head.appendChild(style);

      // Ajouter les filtres SVG si nécessaire
      if (!document.getElementById("color-blind-filters")) {
        const svgFilters = document.createElement("div");
        svgFilters.id = "color-blind-filters";
        svgFilters.innerHTML = `
          <svg style="position: absolute; height: 0; width: 0;">
            <filter id="protanopia-filter">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.567, 0.433, 0,     0, 0
                        0.558, 0.442, 0,     0, 0
                        0,     0.242, 0.758, 0, 0
                        0,     0,     0,     1, 0"/>
            </filter>
            <filter id="deuteranopia-filter">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.625, 0.375, 0,   0, 0
                        0.7,   0.3,   0,   0, 0
                        0,     0.3,   0.7, 0, 0
                        0,     0,     0,   1, 0"/>
            </filter>
            <filter id="tritanopia-filter">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.95, 0.05,  0,     0, 0
                        0,    0.433, 0.567, 0, 0
                        0,    0.475, 0.525, 0, 0
                        0,    0,     0,     1, 0"/>
            </filter>
          </svg>
        `;
        document.body.appendChild(svgFilters);
      }
    }
  }, [fontSize, highContrast, colorBlindMode]);

  return (
    <Router>
      <div
        className={`min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white ${
          highContrast ? "high-contrast" : ""
        }`}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/configurator" element={<Configurator />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <AccessibilityPanel
          onFontSizeChange={setFontSize}
          onContrastChange={setHighContrast}
          onColorBlindModeChange={setColorBlindMode}
        />
      </div>
    </Router>
  );
}

export default App;
