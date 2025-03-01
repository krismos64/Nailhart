import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { fabric } from "fabric";
import JSZip from "jszip";
import {
  Download,
  Pencil,
  Eraser,
  SprayCan as Spray,
  Layers,
  Undo,
  Redo,
  StickerIcon,
  Brush,
  Sparkles,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Palette,
  View,
  Hand,
  Save,
  FolderOpen,
  Trash2,
  Grid,
  Share2,
  BookOpen,
  Image,
} from "lucide-react";
import NailCanvas, { NailShape, NailTexture } from "../components/NailCanvas";
import Nail3DViewer from "../components/Nail3DViewer";
import HandTryOnViewer from "../components/HandTryOnViewer";
import NailPatterns, { NailPattern } from "../components/NailPatterns";
import ShareDesign from "../components/ShareDesign";
import TutorialGuide, { Tutorial } from "../components/TutorialGuide";
import TutorialsList from "../components/TutorialsList";
import ColorExtractor from "../components/ColorExtractor";

// Étendre l'interface Canvas pour inclure undo/redo
interface ExtendedCanvas extends fabric.Canvas {
  undo(): fabric.Object | undefined;
  redo(): void;
}

type Tool = "brush" | "pencil" | "spray" | "eraser" | "glitter";
type Layer = { id: string; name: string; visible: boolean };
type GlitterType = "gold" | "silver" | "rainbow" | "holographic";
type SkinTone = "light" | "medium" | "dark" | "olive" | "deep";
type ViewMode = "editor" | "3d" | "tryOn";

// Type pour les designs sauvegardés
type SavedDesign = {
  id: string;
  name: string;
  date: string;
  nailColors: string[];
  nailShape: NailShape;
  nailTexture: NailTexture;
  thumbnails: string[];
};

const Configurator = () => {
  const [selectedTool, setSelectedTool] = useState<Tool>("brush");
  const [selectedColor, setSelectedColor] = useState("#FF69B4");
  const [brushSize, setBrushSize] = useState(5);
  const [glitterDensity, setGlitterDensity] = useState(5);
  const [selectedGlitter, setSelectedGlitter] = useState<GlitterType>("gold");
  const [selectedNailShape, setSelectedNailShape] =
    useState<NailShape>("round");
  const [selectedNailTexture, setSelectedNailTexture] =
    useState<NailTexture>("glossy");
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinTone>("medium");
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [layers, setLayers] = useState<Layer[]>([
    { id: "base", name: "Fond", visible: true },
    { id: "design", name: "Design", visible: true },
    { id: "effects", name: "Effets", visible: true },
  ]);
  const [nailColors, setNailColors] = useState<string[]>(
    Array(5).fill("#FF69B4")
  );
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);
  const [designName, setDesignName] = useState("");
  const [showPatterns, setShowPatterns] = useState(false);
  const [selectedNailIndex, setSelectedNailIndex] = useState<number | null>(
    null
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTutorialsList, setShowTutorialsList] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [showColorExtractor, setShowColorExtractor] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>([]);

  const canvasRefs = useRef<ExtendedCanvas[]>([]);

  const colors = [
    "#FF69B4", // Pink
    "#FF1493", // Deep Pink
    "#C71585", // Medium Violet Red
    "#4B0082", // Indigo
    "#9400D3", // Dark Violet
    "#8A2BE2", // Blue Violet
    "#FFD700", // Gold
    "#FF4500", // Orange Red
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFFFF", // White
    "#000000", // Black
    "#FFC0CB", // Light Pink
    "#800080", // Purple
    "#008080", // Teal
  ];

  const glitterColors = {
    gold: "#FFD700",
    silver: "#C0C0C0",
    rainbow:
      "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)",
    holographic: "linear-gradient(45deg, #f3f3f3, #c0c0c0, #f3f3f3, #c0c0c0)",
  };

  const skinTones = {
    light: "#f8d5c2",
    medium: "#e8c4a2",
    olive: "#c68e6f",
    dark: "#a67358",
    deep: "#70483c",
  };

  const nailShapes = [
    { id: "round" as NailShape, icon: <Circle />, name: "Rond" },
    { id: "square" as NailShape, icon: <Square />, name: "Carré" },
    { id: "almond" as NailShape, icon: <Triangle />, name: "Amande" },
    { id: "stiletto" as NailShape, icon: <Triangle />, name: "Stiletto" },
    { id: "coffin" as NailShape, icon: <Hexagon />, name: "Ballerine" },
  ];

  const nailTextures = [
    {
      id: "glossy" as NailTexture,
      name: "Brillant",
      description: "Finition brillante et réfléchissante",
    },
    {
      id: "matte" as NailTexture,
      name: "Mat",
      description: "Finition mate sans reflet",
    },
    {
      id: "metallic" as NailTexture,
      name: "Métallique",
      description: "Effet métallisé avec reflets",
    },
    {
      id: "glitter" as NailTexture,
      name: "Pailleté",
      description: "Finition avec paillettes intégrées",
    },
  ];

  const viewModes = [
    { id: "editor" as ViewMode, icon: <Brush />, name: "Éditeur" },
    { id: "3d" as ViewMode, icon: <View />, name: "Vue 3D" },
    { id: "tryOn" as ViewMode, icon: <Hand />, name: "Essai Virtuel" },
  ];

  const tools = [
    { id: "brush" as Tool, icon: <Brush />, name: "Pinceau" },
    { id: "pencil" as Tool, icon: <Pencil />, name: "Crayon" },
    { id: "spray" as Tool, icon: <Spray />, name: "Aérographe" },
    { id: "glitter" as Tool, icon: <Sparkles />, name: "Paillettes" },
    { id: "eraser" as Tool, icon: <Eraser />, name: "Gomme" },
  ];

  const stickers = [
    {
      id: "flower",
      name: "Fleur",
      url: "https://cdn-icons-png.flaticon.com/512/1164/1164620.png",
    },
    {
      id: "star",
      name: "Étoile",
      url: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    },
    {
      id: "heart",
      name: "Cœur",
      url: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
    },
    {
      id: "diamond",
      name: "Diamant",
      url: "https://cdn-icons-png.flaticon.com/512/1728/1728729.png",
    },
    {
      id: "moon",
      name: "Lune",
      url: "https://cdn-icons-png.flaticon.com/512/1823/1823397.png",
    },
    {
      id: "butterfly",
      name: "Papillon",
      url: "https://cdn-icons-png.flaticon.com/512/2317/2317989.png",
    },
  ];

  // Charger les designs sauvegardés au chargement
  useEffect(() => {
    const loadSavedDesigns = () => {
      const savedDesignsJson = localStorage.getItem("nailartDesigns");
      if (savedDesignsJson) {
        try {
          const designs = JSON.parse(savedDesignsJson);
          setSavedDesigns(designs);
        } catch (error) {
          console.error("Erreur lors du chargement des designs:", error);
        }
      }
    };

    loadSavedDesigns();
  }, []);

  const handleCanvasReady = (canvas: fabric.Canvas, index: number) => {
    canvasRefs.current[index] = canvas as ExtendedCanvas;
  };

  const handleUndo = () => {
    canvasRefs.current.forEach((canvas) => {
      if (canvas) {
        canvas.undo();
      }
    });
  };

  const handleRedo = () => {
    canvasRefs.current.forEach((canvas) => {
      if (canvas) {
        canvas.redo();
      }
    });
  };

  const handleAddSticker = (stickerId: string) => {
    const sticker = stickers.find((s) => s.id === stickerId);
    if (sticker) {
      canvasRefs.current.forEach((canvas) => {
        if (canvas) {
          fabric.Image.fromURL(sticker.url, (img) => {
            img.scale(0.2);
            img.set({
              left: 50,
              top: 50,
              selectable: true,
              hasControls: true,
              hasBorders: true,
            });
            canvas.add(img);
            canvas.renderAll();
          });
        }
      });
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(
      layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const handleExport = () => {
    const zip = new JSZip();
    canvasRefs.current.forEach((canvas, index) => {
      if (canvas) {
        const dataURL = canvas.toDataURL({ format: "png" });
        const base64Data = dataURL.split(",")[1];
        zip.file(`nail-${index + 1}.png`, base64Data, { base64: true });
      }
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "nail-designs.zip";
      link.click();
    });
  };

  const handleClearCanvas = (index?: number) => {
    if (index !== undefined) {
      const canvas = canvasRefs.current[index];
      if (canvas) {
        // Conserver uniquement la forme de l'ongle
        const objects = canvas.getObjects();
        if (objects.length > 0) {
          const nailShape = objects[0];
          canvas.clear();
          canvas.add(nailShape);
          canvas.renderAll();
        }
      }
    } else {
      // Effacer tous les ongles
      canvasRefs.current.forEach((canvas) => {
        if (canvas) {
          const objects = canvas.getObjects();
          if (objects.length > 0) {
            const nailShape = objects[0];
            canvas.clear();
            canvas.add(nailShape);
            canvas.renderAll();
          }
        }
      });
    }
  };

  // Fonction pour mettre à jour la couleur d'un ongle spécifique
  const updateNailColor = (index: number, color: string) => {
    const newColors = [...nailColors];
    newColors[index] = color;
    setNailColors(newColors);
  };

  // Fonction pour sauvegarder le design actuel
  const saveCurrentDesign = () => {
    // Générer des miniatures pour chaque ongle
    const thumbnails: string[] = [];
    canvasRefs.current.forEach((canvas) => {
      if (canvas) {
        thumbnails.push(canvas.toDataURL({ format: "png" }));
      }
    });

    // Créer un nouvel objet design
    const newDesign: SavedDesign = {
      id: Date.now().toString(),
      name: designName || `Design ${savedDesigns.length + 1}`,
      date: new Date().toLocaleDateString(),
      nailColors,
      nailShape: selectedNailShape,
      nailTexture: selectedNailTexture,
      thumbnails,
    };

    // Ajouter le design à la liste
    const updatedDesigns = [...savedDesigns, newDesign];
    setSavedDesigns(updatedDesigns);

    // Sauvegarder dans localStorage
    localStorage.setItem("nailartDesigns", JSON.stringify(updatedDesigns));

    // Réinitialiser le nom du design
    setDesignName("");
  };

  // Fonction pour charger un design sauvegardé
  const loadDesign = (design: SavedDesign) => {
    setSelectedNailShape(design.nailShape);
    setSelectedNailTexture(design.nailTexture);
    setNailColors(design.nailColors);
    setShowSavedDesigns(false);

    // Recharger les thumbnails dans les canvas
    design.thumbnails.forEach((thumbnail, index) => {
      const canvas = canvasRefs.current[index];
      if (canvas) {
        fabric.Image.fromURL(thumbnail, (img) => {
          canvas.clear();
          canvas.add(img);
          canvas.renderAll();
        });
      }
    });
  };

  // Fonction pour supprimer un design sauvegardé
  const deleteDesign = (designId: string) => {
    const updatedDesigns = savedDesigns.filter(
      (design) => design.id !== designId
    );
    setSavedDesigns(updatedDesigns);
    localStorage.setItem("nailartDesigns", JSON.stringify(updatedDesigns));
  };

  // Fonction pour appliquer un motif à un ongle spécifique
  const applyPatternToNail = (pattern: NailPattern, index: number) => {
    const canvas = canvasRefs.current[index];
    if (canvas) {
      pattern.apply(canvas);
    }
    setShowPatterns(false);
  };

  // Fonctions pour les tutoriels
  const handleSelectTutorial = (tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
    setShowTutorialsList(false);
  };

  const handleCloseTutorial = () => {
    setActiveTutorial(null);
  };

  const handleSelectTool = (tool: string) => {
    setSelectedTool(tool as Tool);
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
  };

  const handleSelectShape = (shape: string) => {
    setSelectedNailShape(shape as NailShape);
  };

  const handleSelectTexture = (texture: string) => {
    setSelectedNailTexture(texture as NailTexture);
  };

  // Ajouter une couleur personnalisée
  const handleAddCustomColor = (color: string) => {
    if (!customColors.includes(color)) {
      setCustomColors([...customColors, color]);
    }
    setSelectedColor(color);
    setShowColorExtractor(false);
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Configurateur de Nail Art
          </h1>
          <p className="mt-4 text-white/70">
            Créez votre design unique avec nos outils professionnels
          </p>
        </motion.div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/5 backdrop-blur-lg rounded-lg p-1">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                  viewMode === mode.id
                    ? "bg-pink-500 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {mode.icon}
                <span>{mode.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tools Panel */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
            {viewMode === "editor" && (
              <>
                <h3 className="text-lg font-medium mb-4">Outils</h3>
                <div className="space-y-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`w-full p-2 rounded-lg flex items-center space-x-2 transition-all ${
                        selectedTool === tool.id
                          ? "bg-pink-500 text-white"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {tool.icon}
                      <span>{tool.name}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Taille</h3>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-white/50 mt-1 text-center">
                    {brushSize}px
                  </div>
                </div>
              </>
            )}

            {/* Nail Shape Selection - Always visible */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Hexagon className="mr-2" />
                Forme d'ongle
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {nailShapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => setSelectedNailShape(shape.id)}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                      selectedNailShape === shape.id
                        ? "bg-pink-500 text-white"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {shape.icon}
                    <span className="text-xs mt-1">{shape.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nail Texture Selection - Always visible */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Palette className="mr-2" />
                Texture
              </h3>
              <div className="space-y-2">
                {nailTextures.map((texture) => (
                  <button
                    key={texture.id}
                    onClick={() => setSelectedNailTexture(texture.id)}
                    className={`w-full p-2 rounded-lg flex flex-col items-start transition-all ${
                      selectedNailTexture === texture.id
                        ? "bg-pink-500 text-white"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span>{texture.name}</span>
                    <span className="text-xs opacity-70 mt-1">
                      {texture.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Tone Selection - Only visible in 3D and Try On modes */}
            {(viewMode === "3d" || viewMode === "tryOn") && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Hand className="mr-2" />
                  Teinte de peau
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(skinTones).map(([tone, color]) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedSkinTone(tone as SkinTone)}
                      className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                        selectedSkinTone === tone
                          ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      title={tone.charAt(0).toUpperCase() + tone.slice(1)}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedTool === "glitter" && viewMode === "editor" && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Type de Paillettes</h3>
                <div className="space-y-2">
                  {(Object.keys(glitterColors) as GlitterType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedGlitter(type)}
                      className={`w-full p-2 rounded-lg flex items-center justify-between transition-all ${
                        selectedGlitter === type
                          ? "bg-pink-500 text-white"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className="capitalize">{type}</span>
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{
                          background: glitterColors[type],
                          boxShadow: "0 0 5px rgba(255,255,255,0.5)",
                        }}
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Densité</h4>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={glitterDensity}
                    onChange={(e) => setGlitterDensity(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-white/50 mt-1 text-center">
                    {glitterDensity}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Couleurs</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      selectedColor === color
                        ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                {customColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      selectedColor === color
                        ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  onClick={() => setShowColorExtractor(true)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                  title="Extraire des couleurs d'une image"
                >
                  <Image size={16} />
                </button>
              </div>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="mt-4 w-full h-10 rounded-lg"
              />
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-8 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
            {viewMode === "editor" && (
              <>
                <div className="flex justify-between mb-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleClearCanvas()}
                      className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm"
                    >
                      Tout effacer
                    </button>
                    <button
                      onClick={() => setShowPatterns(true)}
                      className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm flex items-center"
                    >
                      <Grid className="w-4 h-4 mr-1" />
                      Motifs
                    </button>
                    <button
                      onClick={() => setShowTutorialsList(true)}
                      className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm flex items-center"
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Tutoriels
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUndo}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                      title="Annuler"
                    >
                      <Undo />
                    </button>
                    <button
                      onClick={handleRedo}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                      title="Rétablir"
                    >
                      <Redo />
                    </button>
                    <button
                      onClick={() => setShowSavedDesigns(true)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                      title="Ouvrir un design"
                    >
                      <FolderOpen />
                    </button>
                    <button
                      onClick={saveCurrentDesign}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                      title="Sauvegarder le design"
                    >
                      <Save />
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                      title="Partager le design"
                    >
                      <Share2 />
                    </button>
                  </div>
                </div>

                {/* Champ pour nommer le design avant sauvegarde */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="Nom du design..."
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="relative">
                      <NailCanvas
                        width={120}
                        height={200}
                        selectedTool={selectedTool}
                        selectedColor={selectedColor}
                        brushSize={brushSize}
                        glitterDensity={glitterDensity}
                        nailShape={selectedNailShape}
                        nailTexture={selectedNailTexture}
                        onCanvasReady={(canvas) =>
                          handleCanvasReady(canvas, index)
                        }
                        index={index}
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={() => handleClearCanvas(index)}
                          className="w-6 h-6 rounded-full bg-red-500/50 hover:bg-red-500/70 flex items-center justify-center text-white text-xs"
                          title="Effacer cet ongle"
                        >
                          ×
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 flex space-x-1">
                        <button
                          onClick={() => updateNailColor(index, selectedColor)}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: selectedColor }}
                          title="Appliquer la couleur sélectionnée"
                        />
                        <button
                          onClick={() => {
                            setSelectedNailIndex(index);
                            setShowPatterns(true);
                          }}
                          className="w-6 h-6 rounded-full bg-purple-500/50 hover:bg-purple-500/70 flex items-center justify-center text-white"
                          title="Appliquer un motif"
                        >
                          <Grid className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {viewMode === "3d" && (
              <div className="h-[500px]">
                <Nail3DViewer
                  nailShape={selectedNailShape}
                  nailTexture={selectedNailTexture}
                  nailColor={selectedColor}
                  skinTone={skinTones[selectedSkinTone]}
                />
              </div>
            )}

            {viewMode === "tryOn" && (
              <div className="h-[500px]">
                <HandTryOnViewer
                  nailShape={selectedNailShape}
                  nailTexture={selectedNailTexture}
                  nailColors={nailColors}
                  skinTone={skinTones[selectedSkinTone]}
                />
              </div>
            )}

            {/* Modal pour afficher les designs sauvegardés */}
            {showSavedDesigns && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Designs Sauvegardés</h3>
                    <button
                      onClick={() => setShowSavedDesigns(false)}
                      className="p-2 rounded-full hover:bg-white/10"
                    >
                      ×
                    </button>
                  </div>

                  {savedDesigns.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                      Aucun design sauvegardé
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedDesigns.map((design) => (
                        <div
                          key={design.id}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{design.name}</h4>
                            <button
                              onClick={() => deleteDesign(design.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-white/50 mb-2">
                            {design.date}
                          </p>
                          <div className="flex space-x-1 mb-4">
                            {design.thumbnails.slice(0, 3).map((thumb, idx) => (
                              <div
                                key={idx}
                                className="w-16 h-24 bg-white/10 rounded overflow-hidden"
                              >
                                <img
                                  src={thumb}
                                  alt={`Ongle ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {design.thumbnails.length > 3 && (
                              <div className="w-16 h-24 bg-white/10 rounded flex items-center justify-center">
                                <span className="text-white/70">
                                  +{design.thumbnails.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-1">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{
                                  background: design.nailColors[0] || "#FF69B4",
                                }}
                                title="Couleur principale"
                              />
                              <div
                                className="text-xs bg-white/10 px-2 py-1 rounded"
                                title="Forme"
                              >
                                {design.nailShape}
                              </div>
                              <div
                                className="text-xs bg-white/10 px-2 py-1 rounded"
                                title="Texture"
                              >
                                {design.nailTexture}
                              </div>
                            </div>
                            <button
                              onClick={() => loadDesign(design)}
                              className="px-3 py-1 bg-pink-500 text-white rounded-lg text-sm"
                            >
                              Charger
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal pour afficher les motifs prédéfinis */}
            {showPatterns && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">
                      Motifs pour Ongle{" "}
                      {selectedNailIndex !== null ? selectedNailIndex + 1 : ""}
                    </h3>
                    <button
                      onClick={() => setShowPatterns(false)}
                      className="p-2 rounded-full hover:bg-white/10"
                    >
                      ×
                    </button>
                  </div>

                  {selectedNailIndex !== null && (
                    <NailPatterns
                      onSelectPattern={(pattern) =>
                        applyPatternToNail(pattern, selectedNailIndex)
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {/* Modal pour partager le design */}
            {showShareModal && (
              <ShareDesign
                thumbnails={canvasRefs.current
                  .map((canvas) =>
                    canvas ? canvas.toDataURL({ format: "png" }) : ""
                  )
                  .filter(Boolean)}
                designName={designName || "Mon design"}
                onClose={() => setShowShareModal(false)}
              />
            )}

            {/* Modal pour afficher la liste des tutoriels */}
            {showTutorialsList && (
              <TutorialsList
                onSelectTutorial={handleSelectTutorial}
                onClose={() => setShowTutorialsList(false)}
              />
            )}

            {/* Modal pour extraire des couleurs */}
            {showColorExtractor && (
              <ColorExtractor
                onSelectColor={handleAddCustomColor}
                onClose={() => setShowColorExtractor(false)}
              />
            )}
          </div>

          {/* Layers & Stickers Panel */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
            {viewMode === "editor" && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Layers className="mr-2" />
                    Calques
                  </h3>
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <button
                        key={layer.id}
                        onClick={() => toggleLayerVisibility(layer.id)}
                        className={`w-full p-2 rounded-lg flex items-center justify-between ${
                          layer.visible ? "bg-white/10" : "bg-white/5"
                        }`}
                      >
                        <span>{layer.name}</span>
                        <div
                          className={`w-4 h-4 rounded-full ${
                            layer.visible ? "bg-pink-500" : "bg-gray-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <StickerIcon className="mr-2" />
                    Stickers
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {stickers.map((sticker) => (
                      <button
                        key={sticker.id}
                        onClick={() => handleAddSticker(sticker.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
                      >
                        {sticker.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {(viewMode === "3d" || viewMode === "tryOn") && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <View className="mr-2" />
                  Instructions
                </h3>
                <div className="text-sm text-white/70 space-y-4">
                  <p>Utilisez la souris pour faire pivoter la vue 3D :</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Cliquez et faites glisser pour faire pivoter</li>
                    <li>Utilisez la molette pour zoomer/dézoomer</li>
                    <li>Cliquez-droit et faites glisser pour déplacer</li>
                  </ul>
                  <p className="mt-4">
                    Modifiez la forme, la texture et la couleur dans le panneau
                    de gauche pour voir les changements en temps réel.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleExport}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
          >
            <Download />
            <span>Exporter les Designs</span>
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            <Share2 />
            <span>Partager</span>
          </button>
          <button
            onClick={() => setShowTutorialsList(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
          >
            <BookOpen />
            <span>Tutoriels</span>
          </button>
        </div>
      </div>

      {/* Tutoriel actif */}
      {activeTutorial && (
        <TutorialGuide
          tutorial={activeTutorial}
          onClose={handleCloseTutorial}
          onSelectTool={handleSelectTool}
          onSelectColor={handleSelectColor}
          onSelectShape={handleSelectShape}
          onSelectTexture={handleSelectTexture}
        />
      )}
    </div>
  );
};

export default Configurator;
