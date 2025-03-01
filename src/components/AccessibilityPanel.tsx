import React, { useState, useEffect } from "react";
import { Settings, ZoomIn, ZoomOut, Eye } from "lucide-react";

interface AccessibilityPanelProps {
  onFontSizeChange: (size: number) => void;
  onContrastChange: (highContrast: boolean) => void;
  onColorBlindModeChange: (mode: ColorBlindMode) => void;
}

export type ColorBlindMode =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  onFontSizeChange,
  onContrastChange,
  onColorBlindModeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlindMode, setColorBlindMode] =
    useState<ColorBlindMode>("normal");

  // Charger les préférences d'accessibilité au chargement
  useEffect(() => {
    const savedFontSize = localStorage.getItem("a11y_fontSize");
    const savedHighContrast = localStorage.getItem("a11y_highContrast");
    const savedColorBlindMode = localStorage.getItem("a11y_colorBlindMode");

    if (savedFontSize) {
      const parsedSize = parseInt(savedFontSize, 10);
      setFontSize(parsedSize);
      onFontSizeChange(parsedSize);
    }

    if (savedHighContrast) {
      const parsedContrast = savedHighContrast === "true";
      setHighContrast(parsedContrast);
      onContrastChange(parsedContrast);
    }

    if (savedColorBlindMode) {
      const parsedMode = savedColorBlindMode as ColorBlindMode;
      setColorBlindMode(parsedMode);
      onColorBlindModeChange(parsedMode);
    }
  }, [onFontSizeChange, onContrastChange, onColorBlindModeChange]);

  // Mettre à jour la taille de la police
  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    onFontSizeChange(newSize);
    localStorage.setItem("a11y_fontSize", newSize.toString());
  };

  // Mettre à jour le contraste
  const handleContrastChange = (newContrast: boolean) => {
    setHighContrast(newContrast);
    onContrastChange(newContrast);
    localStorage.setItem("a11y_highContrast", newContrast.toString());
  };

  // Mettre à jour le mode daltonien
  const handleColorBlindModeChange = (newMode: ColorBlindMode) => {
    setColorBlindMode(newMode);
    onColorBlindModeChange(newMode);
    localStorage.setItem("a11y_colorBlindMode", newMode);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg hover:bg-pink-600 transition-colors"
        aria-label="Paramètres d'accessibilité"
      >
        <Settings />
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-gray-800 rounded-lg p-4 shadow-xl border border-white/10 w-64">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Eye className="mr-2" />
            Accessibilité
          </h3>

          <div className="space-y-4">
            {/* Taille de la police */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Taille du texte
              </label>
              <div className="flex items-center">
                <button
                  onClick={() =>
                    handleFontSizeChange(Math.max(70, fontSize - 10))
                  }
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10"
                  aria-label="Réduire la taille du texte"
                >
                  <ZoomOut size={16} />
                </button>
                <div className="flex-1 mx-2">
                  <input
                    type="range"
                    min="70"
                    max="150"
                    value={fontSize}
                    onChange={(e) =>
                      handleFontSizeChange(parseInt(e.target.value, 10))
                    }
                    className="w-full"
                  />
                </div>
                <button
                  onClick={() =>
                    handleFontSizeChange(Math.min(150, fontSize + 10))
                  }
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10"
                  aria-label="Augmenter la taille du texte"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
              <div className="text-xs text-center mt-1">{fontSize}%</div>
            </div>

            {/* Contraste élevé */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Contraste élevé</span>
                <button
                  onClick={() => handleContrastChange(!highContrast)}
                  className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                    highContrast
                      ? "bg-pink-500 justify-end"
                      : "bg-gray-600 justify-start"
                  }`}
                  aria-checked={highContrast}
                  role="switch"
                >
                  <span
                    className={`w-4 h-4 rounded-full mx-1 ${
                      highContrast ? "bg-white" : "bg-gray-300"
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Mode daltonien */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Mode daltonien
              </label>
              <select
                value={colorBlindMode}
                onChange={(e) =>
                  handleColorBlindModeChange(e.target.value as ColorBlindMode)
                }
                className="w-full p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <option value="normal">Normal</option>
                <option value="protanopia">Protanopie (rouge-vert)</option>
                <option value="deuteranopia">Deutéranopie (vert-rouge)</option>
                <option value="tritanopia">Tritanopie (bleu-jaune)</option>
                <option value="achromatopsia">
                  Achromatopsie (noir et blanc)
                </option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-xs text-white/50">
            Ces paramètres sont sauvegardés automatiquement.
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;
