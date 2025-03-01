import React, { useState, useRef } from "react";
import { Upload, X, Palette } from "lucide-react";

interface ColorExtractorProps {
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

const ColorExtractor: React.FC<ColorExtractorProps> = ({
  onSelectColor,
  onClose,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gérer le téléchargement d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.match("image.*")) {
      setError("Veuillez sélectionner une image valide.");
      return;
    }

    // Réinitialiser les états
    setError(null);
    setExtractedColors([]);

    // Lire le fichier
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Extraire les couleurs de l'image
  const extractColors = () => {
    if (!image || !canvasRef.current) return;

    setIsExtracting(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError(
        "Impossible d'extraire les couleurs. Votre navigateur ne supporte pas Canvas."
      );
      setIsExtracting(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      // Redimensionner le canvas pour correspondre à l'image
      canvas.width = img.width;
      canvas.height = img.height;

      // Dessiner l'image sur le canvas
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Obtenir les données de pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Stocker toutes les couleurs
      const colorMap: { [key: string]: number } = {};

      // Analyser les pixels pour extraire les couleurs
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Convertir RGB en HEX
        const hex = rgbToHex(r, g, b);

        // Compter l'occurrence de chaque couleur
        if (colorMap[hex]) {
          colorMap[hex]++;
        } else {
          colorMap[hex] = 1;
        }
      }

      // Trier les couleurs par fréquence
      const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);

      // Réduire à un ensemble de couleurs représentatives (max 16)
      const representativeColors = getRepresentativeColors(sortedColors, 16);

      setExtractedColors(representativeColors);
      setIsExtracting(false);
    };

    img.onerror = () => {
      setError("Erreur lors du chargement de l'image.");
      setIsExtracting(false);
    };

    img.src = image;
  };

  // Convertir RGB en HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  };

  // Obtenir un ensemble de couleurs représentatives
  const getRepresentativeColors = (
    colors: string[],
    maxColors: number
  ): string[] => {
    // Simplifier en prenant les couleurs les plus fréquentes
    // Dans une implémentation plus avancée, on pourrait utiliser un algorithme de clustering
    return colors.slice(0, maxColors);
  };

  // Ajouter une couleur à la palette
  const handleSelectColor = (color: string) => {
    onSelectColor(color);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium flex items-center">
            <Palette className="mr-2 text-pink-500" />
            Extraire des couleurs d'une image
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          {!image ? (
            <div
              className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-pink-500/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto mb-4 text-white/50" size={40} />
              <p className="text-white/70 mb-2">
                Cliquez pour télécharger une image
              </p>
              <p className="text-xs text-white/50">
                Formats supportés: JPG, PNG, GIF
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-white/5 p-2">
                <img
                  src={image}
                  alt="Image téléchargée"
                  className="max-w-full max-h-[300px] mx-auto object-contain"
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  title="Supprimer l'image"
                >
                  <X size={16} />
                </button>
              </div>

              <button
                onClick={extractColors}
                disabled={isExtracting}
                className={`w-full py-2 rounded-lg ${
                  isExtracting
                    ? "bg-pink-500/50 cursor-not-allowed"
                    : "bg-pink-500 hover:bg-pink-600"
                } flex items-center justify-center`}
              >
                <Palette className="mr-2" size={18} />
                {isExtracting
                  ? "Extraction en cours..."
                  : "Extraire les couleurs"}
              </button>
            </div>
          )}
        </div>

        {extractedColors.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Couleurs extraites</h4>
            <div className="grid grid-cols-8 gap-2">
              {extractedColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectColor(color)}
                  className="w-full aspect-square rounded-lg transition-transform hover:scale-110 hover:shadow-lg"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <p className="text-xs text-white/50 mt-2 text-center">
              Cliquez sur une couleur pour l'ajouter à votre palette
            </p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ColorExtractor;
