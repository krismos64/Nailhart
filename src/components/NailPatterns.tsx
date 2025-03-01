import React from "react";
import { fabric } from "fabric";

export type PatternCategory =
  | "french"
  | "geometric"
  | "floral"
  | "abstract"
  | "seasonal";

export interface NailPattern {
  id: string;
  name: string;
  category: PatternCategory;
  thumbnail: string;
  apply: (canvas: fabric.Canvas) => void;
}

// Fonction pour créer un motif French
const createFrenchTip = (canvas: fabric.Canvas, color: string = "#FFFFFF") => {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  // Créer la pointe française
  const tipPath = new fabric.Path(
    `M 0 ${height * 0.3} Q ${width / 2} ${height * 0.5}, ${width} ${
      height * 0.3
    } L ${width} 0 L 0 0 Z`,
    {
      fill: color,
      selectable: false,
      evented: false,
    }
  );

  canvas.add(tipPath);
  canvas.renderAll();
};

// Fonction pour créer un motif géométrique
const createGeometricPattern = (
  canvas: fabric.Canvas,
  color: string = "#FF69B4"
) => {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  // Créer plusieurs triangles
  for (let i = 0; i < 5; i++) {
    const triangle = new fabric.Triangle({
      width: width * 0.2,
      height: width * 0.2,
      fill: color,
      left: Math.random() * width * 0.8,
      top: Math.random() * height * 0.8,
      angle: Math.random() * 360,
      opacity: 0.7,
      selectable: false,
      evented: false,
    });

    canvas.add(triangle);
  }

  canvas.renderAll();
};

// Fonction pour créer un motif floral
const createFloralPattern = (canvas: fabric.Canvas) => {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  // Créer le centre de la fleur
  const center = new fabric.Circle({
    radius: width * 0.1,
    fill: "#FFDD00",
    left: width / 2 - width * 0.1,
    top: height / 2 - width * 0.1,
    selectable: false,
    evented: false,
  });

  canvas.add(center);

  // Créer les pétales
  const petalColors = ["#FF69B4", "#FF1493", "#C71585", "#DB7093", "#FFB6C1"];

  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const petal = new fabric.Ellipse({
      rx: width * 0.15,
      ry: width * 0.08,
      fill: petalColors[i % petalColors.length],
      left: width / 2 - width * 0.15 + Math.cos(angle) * width * 0.2,
      top: height / 2 - width * 0.08 + Math.sin(angle) * width * 0.2,
      angle: (angle * 180) / Math.PI,
      selectable: false,
      evented: false,
      opacity: 0.8,
    });

    canvas.add(petal);
  }

  canvas.renderAll();
};

// Fonction pour créer un motif abstrait
const createAbstractPattern = (canvas: fabric.Canvas) => {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  // Créer des cercles concentriques
  const colors = ["#FF69B4", "#9400D3", "#4B0082", "#0000FF", "#00FF00"];

  for (let i = 5; i > 0; i--) {
    const circle = new fabric.Circle({
      radius: width * 0.1 * i,
      fill: colors[i - 1],
      left: width / 2 - width * 0.1 * i,
      top: height / 2 - width * 0.1 * i,
      selectable: false,
      evented: false,
      opacity: 0.6,
    });

    canvas.add(circle);
  }

  // Ajouter quelques lignes
  for (let i = 0; i < 5; i++) {
    const line = new fabric.Line(
      [
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
      ],
      {
        stroke: colors[Math.floor(Math.random() * colors.length)],
        strokeWidth: 3,
        selectable: false,
        evented: false,
      }
    );

    canvas.add(line);
  }

  canvas.renderAll();
};

// Fonction pour créer un motif saisonnier (flocons de neige)
const createSnowflakePattern = (canvas: fabric.Canvas) => {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  // Créer plusieurs flocons de neige
  for (let i = 0; i < 8; i++) {
    // Créer un flocon de base (étoile)
    const snowflake = new fabric.Path(
      "M 0 0 L 10 0 M 0 0 L -10 0 M 0 0 L 0 10 M 0 0 L 0 -10 M 0 0 L 7 7 M 0 0 L -7 -7 M 0 0 L 7 -7 M 0 0 L -7 7",
      {
        stroke: "#FFFFFF",
        strokeWidth: 2,
        left: Math.random() * width,
        top: Math.random() * height,
        scaleX: 0.5 + Math.random() * 1,
        scaleY: 0.5 + Math.random() * 1,
        selectable: false,
        evented: false,
        opacity: 0.8,
      }
    );

    canvas.add(snowflake);
  }

  canvas.renderAll();
};

// Définir les motifs disponibles
export const nailPatterns: NailPattern[] = [
  {
    id: "french-classic",
    name: "French Classique",
    category: "french",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/1909/1909783.png",
    apply: (canvas) => createFrenchTip(canvas),
  },
  {
    id: "french-colored",
    name: "French Colorée",
    category: "french",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/1909/1909783.png",
    apply: (canvas) => createFrenchTip(canvas, "#FF69B4"),
  },
  {
    id: "geometric-triangles",
    name: "Triangles",
    category: "geometric",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/3254/3254516.png",
    apply: (canvas) => createGeometricPattern(canvas),
  },
  {
    id: "geometric-colored",
    name: "Triangles Colorés",
    category: "geometric",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/3254/3254516.png",
    apply: (canvas) => createGeometricPattern(canvas, "#9400D3"),
  },
  {
    id: "floral-daisy",
    name: "Marguerite",
    category: "floral",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/1164/1164620.png",
    apply: (canvas) => createFloralPattern(canvas),
  },
  {
    id: "abstract-circles",
    name: "Cercles Abstraits",
    category: "abstract",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/3254/3254636.png",
    apply: (canvas) => createAbstractPattern(canvas),
  },
  {
    id: "seasonal-snowflakes",
    name: "Flocons de Neige",
    category: "seasonal",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/2336/2336392.png",
    apply: (canvas) => createSnowflakePattern(canvas),
  },
];

interface NailPatternsProps {
  onSelectPattern: (pattern: NailPattern) => void;
}

const NailPatterns: React.FC<NailPatternsProps> = ({ onSelectPattern }) => {
  // Regrouper les motifs par catégorie
  const patternsByCategory: Record<PatternCategory, NailPattern[]> = {
    french: [],
    geometric: [],
    floral: [],
    abstract: [],
    seasonal: [],
  };

  nailPatterns.forEach((pattern) => {
    patternsByCategory[pattern.category].push(pattern);
  });

  // Traduire les noms des catégories
  const categoryNames: Record<PatternCategory, string> = {
    french: "French",
    geometric: "Géométrique",
    floral: "Floral",
    abstract: "Abstrait",
    seasonal: "Saisonnier",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Motifs Prédéfinis</h3>

      {Object.entries(patternsByCategory).map(([category, patterns]) => (
        <div key={category} className="mb-4">
          <h4 className="text-sm font-medium mb-2">
            {categoryNames[category as PatternCategory]}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => onSelectPattern(pattern)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 flex flex-col items-center"
              >
                <img
                  src={pattern.thumbnail}
                  alt={pattern.name}
                  className="w-8 h-8 mb-1 opacity-80"
                />
                <span className="text-xs">{pattern.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NailPatterns;
