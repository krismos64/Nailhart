import React, { useState } from "react";
import { BookOpen, Clock, Search } from "lucide-react";
import { Tutorial } from "./TutorialGuide";

// Tutoriels prédéfinis
export const tutorials: Tutorial[] = [
  {
    id: "french-manicure",
    title: "French Manucure Classique",
    description:
      "Apprenez à créer une french manucure élégante et intemporelle.",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/1909/1909783.png",
    difficulty: "débutant",
    duration: "5 min",
    steps: [
      {
        title: "Préparer la base",
        description:
          "Commencez par sélectionner la forme d'ongle 'round' et la texture 'glossy'.",
        shapeToUse: "round",
        textureToUse: "glossy",
        action: "Sélectionnez la forme et la texture appropriées.",
      },
      {
        title: "Appliquer la couleur de base",
        description:
          "Utilisez un rose pâle transparent comme base pour votre french manucure.",
        colorToUse: "#FDE4E1",
        toolToUse: "brush",
        action: "Appliquez la couleur sur l'ensemble de l'ongle.",
      },
      {
        title: "Créer la pointe blanche",
        description:
          "Utilisez le pinceau avec du blanc pour créer la pointe caractéristique de la french manucure.",
        colorToUse: "#FFFFFF",
        toolToUse: "brush",
        action: "Dessinez un arc de cercle sur le bout de l'ongle.",
      },
      {
        title: "Finaliser",
        description:
          "Ajoutez une couche de finition brillante pour un résultat professionnel.",
        textureToUse: "glossy",
        action: "Admirez votre french manucure classique !",
      },
    ],
  },
  {
    id: "gradient-nails",
    title: "Ongles Dégradés",
    description: "Créez un magnifique dégradé de couleurs sur vos ongles.",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/3254/3254636.png",
    difficulty: "intermédiaire",
    duration: "10 min",
    steps: [
      {
        title: "Choisir les couleurs",
        description:
          "Sélectionnez deux couleurs complémentaires pour votre dégradé.",
        colorToUse: "#FF69B4",
        action: "Choisissez votre première couleur (rose vif).",
      },
      {
        title: "Appliquer la première couleur",
        description:
          "Appliquez la première couleur sur la moitié inférieure de l'ongle.",
        toolToUse: "brush",
        action: "Couvrez la moitié inférieure de l'ongle avec la couleur rose.",
      },
      {
        title: "Appliquer la deuxième couleur",
        description:
          "Appliquez la deuxième couleur (violet) sur la moitié supérieure de l'ongle.",
        colorToUse: "#9400D3",
        toolToUse: "brush",
        action:
          "Couvrez la moitié supérieure de l'ongle avec la couleur violette.",
      },
      {
        title: "Créer le dégradé",
        description:
          "Utilisez l'outil de spray pour mélanger les deux couleurs à leur jonction.",
        toolToUse: "spray",
        action:
          "Vaporisez doucement à la jonction des deux couleurs pour créer un effet de dégradé.",
      },
      {
        title: "Finaliser",
        description: "Ajoutez quelques paillettes pour un effet plus glamour.",
        toolToUse: "glitter",
        action: "Appliquez des paillettes sur le dégradé pour plus d'éclat.",
      },
    ],
  },
  {
    id: "geometric-design",
    title: "Design Géométrique",
    description: "Créez un design moderne avec des formes géométriques.",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/3254/3254516.png",
    difficulty: "avancé",
    duration: "15 min",
    steps: [
      {
        title: "Préparer la base",
        description:
          "Commencez par une base noire pour faire ressortir les formes géométriques.",
        colorToUse: "#000000",
        action: "Appliquez la couleur noire sur tout l'ongle.",
      },
      {
        title: "Dessiner les lignes",
        description:
          "Utilisez le crayon avec une couleur or pour dessiner des lignes droites.",
        toolToUse: "pencil",
        colorToUse: "#FFD700",
        action: "Dessinez plusieurs lignes droites qui se croisent.",
      },
      {
        title: "Ajouter des triangles",
        description:
          "Remplissez certains espaces avec des triangles de couleur.",
        toolToUse: "brush",
        colorToUse: "#FF69B4",
        action: "Remplissez quelques triangles formés par les lignes.",
      },
      {
        title: "Ajouter des cercles",
        description:
          "Ajoutez quelques petits cercles à des points stratégiques.",
        toolToUse: "brush",
        colorToUse: "#FFFFFF",
        action: "Dessinez de petits cercles aux intersections des lignes.",
      },
      {
        title: "Finaliser avec des paillettes",
        description:
          "Ajoutez des paillettes sur certaines zones pour plus d'éclat.",
        toolToUse: "glitter",
        action: "Appliquez des paillettes sur certaines formes géométriques.",
      },
    ],
  },
];

interface TutorialsListProps {
  onSelectTutorial: (tutorial: Tutorial) => void;
  onClose: () => void;
}

const TutorialsList: React.FC<TutorialsListProps> = ({
  onSelectTutorial,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );

  // Filtrer les tutoriels en fonction de la recherche et de la difficulté
  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      selectedDifficulty === null || tutorial.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  // Couleurs pour les niveaux de difficulté
  const difficultyColors = {
    débutant: "bg-green-500/20 text-green-300",
    intermédiaire: "bg-yellow-500/20 text-yellow-300",
    avancé: "bg-red-500/20 text-red-300",
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium flex items-center">
            <BookOpen className="mr-2 text-pink-500" />
            Tutoriels de Nail Art
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un tutoriel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-white/5 border border-white/10 focus:border-pink-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-3 text-white/50" size={18} />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDifficulty(null)}
            className={`px-3 py-1 rounded-lg text-sm ${
              selectedDifficulty === null
                ? "bg-pink-500 text-white"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedDifficulty("débutant")}
            className={`px-3 py-1 rounded-lg text-sm ${
              selectedDifficulty === "débutant"
                ? "bg-green-500 text-white"
                : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
            }`}
          >
            Débutant
          </button>
          <button
            onClick={() => setSelectedDifficulty("intermédiaire")}
            className={`px-3 py-1 rounded-lg text-sm ${
              selectedDifficulty === "intermédiaire"
                ? "bg-yellow-500 text-white"
                : "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
            }`}
          >
            Intermédiaire
          </button>
          <button
            onClick={() => setSelectedDifficulty("avancé")}
            className={`px-3 py-1 rounded-lg text-sm ${
              selectedDifficulty === "avancé"
                ? "bg-red-500 text-white"
                : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
            }`}
          >
            Avancé
          </button>
        </div>

        {filteredTutorials.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            Aucun tutoriel ne correspond à votre recherche.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-pink-500/50 transition-colors cursor-pointer"
                onClick={() => onSelectTutorial(tutorial)}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    <img
                      src={tutorial.thumbnail}
                      alt={tutorial.title}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </div>
                <h4 className="font-medium text-center mb-2">
                  {tutorial.title}
                </h4>
                <p className="text-xs text-white/70 mb-4 text-center">
                  {tutorial.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1 text-white/50" />
                    <span className="text-xs text-white/50">
                      {tutorial.duration}
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      difficultyColors[
                        tutorial.difficulty as keyof typeof difficultyColors
                      ]
                    }`}
                  >
                    {tutorial.difficulty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialsList;
