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

// Fonction pour créer un effet de paillettes
const createGlitterEffect = (
  canvas: fabric.Canvas,
  baseColor: string,
  density: number = 5,
  nailPath: fabric.Path
) => {
  // Convertir la densité en pourcentage de points à ajouter
  const glitterPercentage = Math.min(0.01 * density, 0.1); // Entre 0.01 et 0.1

  // Dimensions du canvas
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  // Nombre de paillettes à ajouter
  const numGlitters = Math.floor((width * height * glitterPercentage) / 100);

  // Créer un groupe pour contenir toutes les paillettes
  const glitterGroup = new fabric.Group([], {
    selectable: false,
    evented: false,
  });

  // Fonction pour éclaircir une couleur
  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 0 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  // Obtenir les limites de la forme de l'ongle
  const nailBounds = nailPath.getBoundingRect();

  // Ajouter des paillettes aléatoires
  let addedGlitters = 0;
  let attempts = 0;
  const maxAttempts = numGlitters * 3; // Limiter le nombre de tentatives

  while (addedGlitters < numGlitters && attempts < maxAttempts) {
    attempts++;

    // Position aléatoire dans les limites de l'ongle
    const x = nailBounds.left + Math.random() * nailBounds.width;
    const y = nailBounds.top + Math.random() * nailBounds.height;

    // Vérifier si le point est à l'intérieur de la forme de l'ongle
    // Nous utilisons une approximation simple basée sur la distance au centre pour les formes arrondies
    const centerX = nailBounds.left + nailBounds.width / 2;
    const centerY = nailBounds.top + nailBounds.height / 2;

    // Pour les formes arrondies (round, almond, stiletto), vérifier la distance au centre
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );
    const maxDistance = Math.min(nailBounds.width, nailBounds.height) * 0.45;

    // Condition simplifiée pour déterminer si le point est dans l'ongle
    // Pour les formes carrées, on accepte tous les points dans le rectangle
    const isInNail =
      distanceFromCenter <= maxDistance ||
      (x >= nailBounds.left &&
        x <= nailBounds.left + nailBounds.width &&
        y >= nailBounds.top &&
        y <= nailBounds.top + nailBounds.height * 0.8);

    if (isInNail) {
      // Taille aléatoire entre 1 et 3
      const size = 1 + Math.random() * 2;

      // Couleur légèrement plus claire que la base
      const glitterColor = lightenColor(baseColor, 30 + Math.random() * 50);

      // Créer une paillette (petit cercle)
      const glitter = new fabric.Circle({
        left: x,
        top: y,
        radius: size,
        fill: glitterColor,
        opacity: 0.7 + Math.random() * 0.3,
        selectable: false,
        evented: false,
      });

      glitterGroup.addWithUpdate(glitter);
      addedGlitters++;
    }
  }

  // Ajouter le groupe au canvas
  canvas.add(glitterGroup);
  canvas.renderAll();

  return glitterGroup;
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
  const glitterEffectRef = useRef<fabric.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastPointerPosition = useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = useRef<boolean>(false);

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

  // Fonction pour animer les paillettes
  const animateGlitters = () => {
    if (fabricRef.current) {
      const canvas = fabricRef.current;

      // Parcourir tous les objets du canvas
      canvas.getObjects().forEach((obj) => {
        // Vérifier si c'est une paillette (cercle avec une opacité spécifique)
        if (
          obj instanceof fabric.Circle &&
          obj.opacity &&
          obj.opacity >= 0.5 &&
          obj.opacity <= 1
        ) {
          // Faire varier légèrement l'opacité pour créer un effet de scintillement
          const newOpacity = 0.5 + Math.random() * 0.5;
          obj.set("opacity", newOpacity);

          // Parfois, faire varier légèrement la taille
          if (Math.random() > 0.8) {
            const currentRadius = obj.radius || 2;
            const newRadius = currentRadius * (0.9 + Math.random() * 0.2);
            obj.set("radius", newRadius);
          }
        }
      });

      canvas.renderAll();

      // Continuer l'animation
      animationFrameRef.current = requestAnimationFrame(animateGlitters);
    }
  };

  // Démarrer l'animation des paillettes lorsque la texture est "glitter"
  useEffect(() => {
    if (nailTexture === "glitter") {
      // Démarrer l'animation
      animationFrameRef.current = requestAnimationFrame(animateGlitters);
    } else {
      // Arrêter l'animation si elle est en cours
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    // Nettoyer l'animation lors du démontage du composant
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [nailTexture]);

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
          // Utiliser PencilBrush pour l'outil paillettes
          brush = new fabric.PencilBrush(canvas);
          brush.width = brushSize;
          brush.color = selectedColor;

          // Ajouter des paillettes à chaque mouvement du pinceau
          canvas.on("mouse:up", function (e) {
            if (selectedTool === "glitter" && nailShapeRef.current) {
              // Créer un petit groupe de paillettes à la position actuelle
              const pointer = canvas.getPointer(e.e);
              const glitterSize = brushSize * 3; // Zone plus large que le pinceau

              // Obtenir les limites de la forme de l'ongle
              const nailBounds = nailShapeRef.current.getBoundingRect();
              const centerX = nailBounds.left + nailBounds.width / 2;
              const centerY = nailBounds.top + nailBounds.height / 2;

              for (let i = 0; i < glitterDensity * 2; i++) {
                const offsetX = (Math.random() - 0.5) * glitterSize;
                const offsetY = (Math.random() - 0.5) * glitterSize;

                const x = pointer.x + offsetX;
                const y = pointer.y + offsetY;

                // Vérifier si le point est à l'intérieur de la forme de l'ongle
                // Nous utilisons une approximation simple basée sur la distance au centre pour les formes arrondies
                const distanceFromCenter = Math.sqrt(
                  Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                );
                const maxDistance =
                  Math.min(nailBounds.width, nailBounds.height) * 0.45;

                // Condition simplifiée pour déterminer si le point est dans l'ongle
                const isInNail =
                  distanceFromCenter <= maxDistance ||
                  (x >= nailBounds.left &&
                    x <= nailBounds.left + nailBounds.width &&
                    y >= nailBounds.top &&
                    y <= nailBounds.top + nailBounds.height * 0.8);

                if (isInNail) {
                  // Taille aléatoire entre 1 et 3
                  const size = 1 + Math.random() * 2;

                  // Couleur légèrement plus claire
                  const r = parseInt(selectedColor.slice(1, 3), 16);
                  const g = parseInt(selectedColor.slice(3, 5), 16);
                  const b = parseInt(selectedColor.slice(5, 7), 16);

                  const brightnessOffset = Math.floor(Math.random() * 100);
                  const glitterColor = `rgb(${Math.min(
                    r + brightnessOffset,
                    255
                  )}, ${Math.min(g + brightnessOffset, 255)}, ${Math.min(
                    b + brightnessOffset,
                    255
                  )})`;

                  // Créer une paillette
                  const glitter = new fabric.Circle({
                    left: x,
                    top: y,
                    radius: size,
                    fill: glitterColor,
                    opacity: 0.7 + Math.random() * 0.3,
                    selectable: false,
                    evented: false,
                  });

                  canvas.add(glitter);
                }
              }

              canvas.renderAll();
            }
          });
          break;
        }
        case "dots": {
          // Désactiver le mode dessin pour l'outil points
          canvas.isDrawingMode = false;

          // Nettoyer les gestionnaires d'événements existants
          canvas.off("mouse:down");
          canvas.off("mouse:move");
          canvas.off("mouse:up");

          // Ajouter un gestionnaire pour dessiner des points
          canvas.on("mouse:down", function (e) {
            if (selectedTool === "dots" && nailShapeRef.current) {
              const pointer = canvas.getPointer(e.e);

              // Obtenir les limites de la forme de l'ongle
              const nailBounds = nailShapeRef.current.getBoundingRect();
              const centerX = nailBounds.left + nailBounds.width / 2;
              const centerY = nailBounds.top + nailBounds.height / 2;

              // Vérifier si le point est à l'intérieur de la forme de l'ongle
              const distanceFromCenter = Math.sqrt(
                Math.pow(pointer.x - centerX, 2) +
                  Math.pow(pointer.y - centerY, 2)
              );
              const maxDistance =
                Math.min(nailBounds.width, nailBounds.height) * 0.45;

              const isInNail =
                distanceFromCenter <= maxDistance ||
                (pointer.x >= nailBounds.left &&
                  pointer.x <= nailBounds.left + nailBounds.width &&
                  pointer.y >= nailBounds.top &&
                  pointer.y <= nailBounds.top + nailBounds.height * 0.8);

              if (isInNail) {
                // Créer un point
                const dot = new fabric.Circle({
                  left: pointer.x - brushSize / 2,
                  top: pointer.y - brushSize / 2,
                  radius: brushSize / 2,
                  fill: selectedColor,
                  opacity: 1,
                  selectable: false,
                  evented: false,
                });

                canvas.add(dot);
                canvas.renderAll();
              }
            }
          });
          break;
        }
        case "lines": {
          // Désactiver le mode dessin pour l'outil lignes
          canvas.isDrawingMode = false;

          // Nettoyer les gestionnaires d'événements existants
          canvas.off("mouse:down");
          canvas.off("mouse:move");
          canvas.off("mouse:up");

          // Ajouter des gestionnaires pour dessiner des lignes
          canvas.on("mouse:down", function (e) {
            if (selectedTool === "lines" && nailShapeRef.current) {
              isDrawingRef.current = true;
              const pointer = canvas.getPointer(e.e);
              lastPointerPosition.current = { x: pointer.x, y: pointer.y };
            }
          });

          canvas.on("mouse:move", function (e) {
            if (
              selectedTool === "lines" &&
              isDrawingRef.current &&
              lastPointerPosition.current &&
              nailShapeRef.current
            ) {
              const pointer = canvas.getPointer(e.e);

              // Obtenir les limites de la forme de l'ongle
              const nailBounds = nailShapeRef.current.getBoundingRect();
              const centerX = nailBounds.left + nailBounds.width / 2;
              const centerY = nailBounds.top + nailBounds.height / 2;

              // Vérifier si le point est à l'intérieur de la forme de l'ongle
              const distanceFromCenter = Math.sqrt(
                Math.pow(pointer.x - centerX, 2) +
                  Math.pow(pointer.y - centerY, 2)
              );
              const maxDistance =
                Math.min(nailBounds.width, nailBounds.height) * 0.45;

              const isInNail =
                distanceFromCenter <= maxDistance ||
                (pointer.x >= nailBounds.left &&
                  pointer.x <= nailBounds.left + nailBounds.width &&
                  pointer.y >= nailBounds.top &&
                  pointer.y <= nailBounds.top + nailBounds.height * 0.8);

              if (isInNail) {
                // Prévisualiser la ligne
                // Supprimer la prévisualisation précédente si elle existe
                canvas.getObjects().forEach((obj) => {
                  if (obj.data && obj.data.isPreview) {
                    canvas.remove(obj);
                  }
                });

                // Créer une ligne de prévisualisation
                const previewLine = new fabric.Line(
                  [
                    lastPointerPosition.current.x,
                    lastPointerPosition.current.y,
                    pointer.x,
                    pointer.y,
                  ],
                  {
                    stroke: selectedColor,
                    strokeWidth: brushSize,
                    strokeDashArray: [5, 5], // Ligne pointillée pour la prévisualisation
                    selectable: false,
                    evented: false,
                    data: { isPreview: true },
                  }
                );

                canvas.add(previewLine);
                canvas.renderAll();
              }
            }
          });

          canvas.on("mouse:up", function (e) {
            if (
              selectedTool === "lines" &&
              isDrawingRef.current &&
              lastPointerPosition.current &&
              nailShapeRef.current
            ) {
              const pointer = canvas.getPointer(e.e);

              // Supprimer la prévisualisation
              canvas.getObjects().forEach((obj) => {
                if (obj.data && obj.data.isPreview) {
                  canvas.remove(obj);
                }
              });

              // Créer une ligne
              const line = new fabric.Line(
                [
                  lastPointerPosition.current.x,
                  lastPointerPosition.current.y,
                  pointer.x,
                  pointer.y,
                ],
                {
                  stroke: selectedColor,
                  strokeWidth: brushSize,
                  selectable: false,
                  evented: false,
                }
              );

              // Ajouter la ligne au canvas
              canvas.add(line);
              canvas.renderAll();

              // Réinitialiser l'état du dessin
              isDrawingRef.current = false;
              lastPointerPosition.current = null;
            }
          });
          break;
        }
        case "french": {
          // Désactiver le mode dessin pour l'outil french manucure
          canvas.isDrawingMode = false;

          // Nettoyer les gestionnaires d'événements existants
          canvas.off("mouse:down");

          // Ajouter un gestionnaire pour appliquer une french manucure
          canvas.on("mouse:down", function () {
            if (selectedTool === "french" && nailShapeRef.current) {
              // Obtenir les limites de la forme de l'ongle
              const nailBounds = nailShapeRef.current.getBoundingRect();

              // Créer la base (partie principale de l'ongle)
              const baseColor = "#fff3f3"; // Couleur rose pâle pour la base
              nailShapeRef.current.set("fill", baseColor);

              // Supprimer tous les objets existants sauf la forme de l'ongle
              const objects = canvas.getObjects();
              for (let i = objects.length - 1; i >= 0; i--) {
                if (objects[i] !== nailShapeRef.current) {
                  canvas.remove(objects[i]);
                }
              }

              // Créer le bout blanc (french)
              // Hauteur du bout blanc (25% de la hauteur de l'ongle)

              // Créer un chemin pour le bout blanc
              const tipPath = new fabric.Path(nailShapePaths[nailShape], {
                left: 0,
                top: 0,
                fill: selectedColor, // Utiliser la couleur sélectionnée (généralement blanc)
                selectable: false,
                evented: false,
                scaleX: width / 100,
                scaleY: height / 200,
              });

              // Créer un groupe pour le bout blanc
              const tipGroup = new fabric.Group([tipPath], {
                selectable: false,
                evented: false,
              });

              // Ajouter le bout blanc au canvas
              canvas.add(tipGroup);

              // Appliquer un masque pour ne montrer que le bout de l'ongle
              const clipPath = new fabric.Rect({
                left: 0,
                top: nailBounds.height * 0.75,
                width: width,
                height: nailBounds.height * 0.25,
                absolutePositioned: true,
              });

              tipGroup.clipPath = clipPath;

              canvas.renderAll();
            }
          });
          break;
        }
        default: {
          brush = new fabric.PencilBrush(canvas);
          break;
        }
      }

      if (brush) {
        canvas.freeDrawingBrush = brush;

        if (selectedTool !== "eraser") {
          canvas.freeDrawingBrush.color = selectedColor;
        }
        canvas.freeDrawingBrush.width = brushSize;
      }
    }
  }, [
    selectedTool,
    selectedColor,
    brushSize,
    glitterDensity,
    nailShape,
    width,
    height,
  ]);

  // Effet pour appliquer des effets de texture spéciaux
  useEffect(() => {
    if (fabricRef.current && nailShapeRef.current) {
      const canvas = fabricRef.current;

      // Supprimer l'ancien effet de paillettes s'il existe
      if (glitterEffectRef.current) {
        canvas.remove(glitterEffectRef.current);
        glitterEffectRef.current = null;
      }

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
        // Effet pailleté avec texture de paillettes
        nailShapeRef.current.set("fill", selectedColor);

        // Ajouter l'effet de paillettes par-dessus
        const glitterGroup = createGlitterEffect(
          canvas,
          selectedColor,
          glitterDensity,
          nailShapeRef.current
        );
        glitterEffectRef.current = glitterGroup;
      } else {
        // Autres textures
        nailShapeRef.current.set("fill", "#fff3f3");
      }

      canvas.renderAll();
    }
  }, [nailTexture, width, height, selectedColor, glitterDensity]);

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
