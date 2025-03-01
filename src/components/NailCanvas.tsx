import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";

// Étendre l'interface Canvas pour inclure undo/redo
interface ExtendedCanvas extends fabric.Canvas {
  undo(): fabric.Object | undefined;
  redo(): void;
}

// Définir les différentes formes d'ongles disponibles
export type NailShape = "round" | "square" | "almond" | "stiletto" | "coffin";

// Définir les différentes textures d'ongles
export type NailTexture = "glossy" | "matte" | "metallic" | "glitter";

interface NailCanvasProps {
  width: number;
  height: number;
  selectedTool: string;
  selectedColor: string;
  brushSize: number;
  glitterDensity?: number;
  nailShape?: NailShape;
  nailTexture?: NailTexture;
  onCanvasReady: (canvas: fabric.Canvas) => void;
  index: number;
}

// Définir les chemins SVG pour chaque forme d'ongle
const nailShapePaths: Record<NailShape, string> = {
  round:
    "M 50,0 Q 100,0 100,50 L 100,150 Q 100,200 50,200 Q 0,200 0,150 L 0,50 Q 0,0 50,0 z",
  square: "M 10,0 L 90,0 L 100,50 L 100,180 L 0,180 L 0,50 L 10,0 z",
  almond:
    "M 50,0 Q 100,0 100,70 L 80,180 Q 65,200 50,200 Q 35,200 20,180 L 0,70 Q 0,0 50,0 z",
  stiletto:
    "M 50,0 Q 90,0 90,70 L 60,200 Q 55,210 50,210 Q 45,210 40,200 L 10,70 Q 10,0 50,0 z",
  coffin: "M 10,0 L 90,0 L 100,70 L 70,180 L 30,180 L 0,70 L 10,0 z",
};

// Définir les textures pour chaque type
const nailTextures: Record<
  NailTexture,
  { opacity: number; filter?: fabric.IBaseFilter[] }
> = {
  glossy: {
    opacity: 0.7,
    filter: [new fabric.Image.filters.Brightness({ brightness: 0.1 })],
  },
  matte: {
    opacity: 1.0,
  },
  metallic: {
    opacity: 0.8,
    filter: [new fabric.Image.filters.Contrast({ contrast: 0.2 })],
  },
  glitter: {
    opacity: 0.9,
    filter: [new fabric.Image.filters.Brightness({ brightness: 0.05 })],
  },
};

const NailCanvas: React.FC<NailCanvasProps> = ({
  width,
  height,
  selectedTool,
  selectedColor,
  brushSize,
  glitterDensity = 5,
  nailShape = "round",
  nailTexture = "glossy",
  onCanvasReady,
  index,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<ExtendedCanvas | null>(null);
  const nailShapeRef = useRef<fabric.Path | null>(null);

  // Fonction pour créer la forme de l'ongle
  const createNailShape = (
    canvas: fabric.Canvas,
    shape: NailShape,
    color: string = "#fff3f3"
  ) => {
    // Supprimer l'ancienne forme si elle existe
    if (nailShapeRef.current) {
      canvas.remove(nailShapeRef.current);
    }

    // Créer la nouvelle forme
    const nailPath = new fabric.Path(nailShapePaths[shape], {
      left: 0,
      top: 0,
      fill: color,
      selectable: false,
      evented: false,
      scaleX: width / 100,
      scaleY: height / 200,
    });

    // Appliquer la texture
    const textureSettings = nailTextures[nailTexture];
    nailPath.opacity = textureSettings.opacity;

    // Ajouter la forme au canvas
    canvas.add(nailPath);
    canvas.renderAll();

    // Mettre à jour la référence
    nailShapeRef.current = nailPath;

    return nailPath;
  };

  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        isDrawingMode: true,
        backgroundColor: "transparent",
      }) as ExtendedCanvas;

      // Add undo/redo functionality
      canvas.undo = function () {
        if (this._objects.length > 0) {
          const lastObject = this._objects.pop();
          this.renderAll();
          return lastObject;
        }
        return undefined;
      };

      canvas.redo = function () {
        // Implement redo functionality if needed
      };

      // Create nail shape
      createNailShape(canvas, nailShape);

      fabricRef.current = canvas;
      onCanvasReady(canvas);

      // Initialize brush
      const brush = new fabric.PencilBrush(canvas);
      brush.color = selectedColor;
      brush.width = brushSize;
      canvas.freeDrawingBrush = brush;
    }
  }, [
    width,
    height,
    selectedColor,
    brushSize,
    onCanvasReady,
    nailShape,
    nailTexture,
  ]);

  // Mettre à jour la forme de l'ongle lorsqu'elle change
  useEffect(() => {
    if (fabricRef.current) {
      createNailShape(fabricRef.current, nailShape);
    }
  }, [nailShape, nailTexture, width, height]);

  useEffect(() => {
    if (fabricRef.current) {
      const canvas = fabricRef.current;
      canvas.isDrawingMode = true;

      let brush;

      switch (selectedTool) {
        case "brush": {
          brush = new fabric.PencilBrush(canvas);
          break;
        }
        case "pencil": {
          brush = new fabric.PencilBrush(canvas);
          break;
        }
        case "spray": {
          // Créer un PencilBrush pour éviter les problèmes avec SprayBrush
          brush = new fabric.PencilBrush(canvas);
          break;
        }
        case "eraser": {
          // Utiliser PencilBrush avec une couleur de fond pour simuler une gomme
          brush = new fabric.PencilBrush(canvas);
          brush.color = "#fff3f3"; // Couleur du fond de l'ongle
          break;
        }
        case "glitter": {
          // Utiliser PencilBrush avec une taille variable pour simuler des paillettes
          brush = new fabric.PencilBrush(canvas);
          brush.width = brushSize;
          // Simuler l'effet de paillettes avec une couleur brillante
          brush.color = selectedColor;
          break;
        }
        default: {
          brush = new fabric.PencilBrush(canvas);
          break;
        }
      }

      canvas.freeDrawingBrush = brush;

      if (selectedTool !== "eraser") {
        canvas.freeDrawingBrush.color = selectedColor;
      }
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [selectedTool, selectedColor, brushSize, glitterDensity]);

  // Effet pour appliquer des effets de texture spéciaux
  useEffect(() => {
    if (fabricRef.current && nailShapeRef.current) {
      // Appliquer des effets spéciaux en fonction de la texture
      const textureSettings = nailTextures[nailTexture];
      nailShapeRef.current.opacity = textureSettings.opacity;

      // Ajouter des effets visuels supplémentaires selon la texture
      if (nailTexture === "metallic") {
        // Effet métallique avec dégradé
        const gradient = new fabric.Gradient({
          type: "linear",
          coords: { x1: 0, y1: 0, x2: width, y2: height },
          colorStops: [
            { offset: 0, color: "rgba(255,255,255,0.7)" },
            { offset: 0.5, color: "rgba(255,255,255,0.1)" },
            { offset: 1, color: "rgba(255,255,255,0.7)" },
          ],
        });
        nailShapeRef.current.set("fill", gradient);
      } else if (nailTexture === "glitter") {
        // Effet pailleté
        // Ici on pourrait ajouter des points brillants aléatoires
        // Mais pour simplifier, on utilise juste une couleur brillante
        nailShapeRef.current.set("fill", selectedColor);
      } else {
        // Autres textures
        nailShapeRef.current.set("fill", "#fff3f3");
      }

      fabricRef.current.renderAll();
    }
  }, [nailTexture, width, height, selectedColor]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="rounded-t-full border-2 border-white/10"
      />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-white/70">
        Ongle {index + 1}
      </div>
    </div>
  );
};

export default NailCanvas;
