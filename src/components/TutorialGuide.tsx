import React, { useState, useEffect } from "react";
import { BookOpen, ChevronLeft, ChevronRight, X, Check } from "lucide-react";

export interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  toolToUse?: string;
  colorToUse?: string;
  shapeToUse?: string;
  textureToUse?: string;
  action: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  difficulty: "débutant" | "intermédiaire" | "avancé";
  duration: string;
  steps: TutorialStep[];
}

interface TutorialGuideProps {
  tutorial: Tutorial;
  onClose: () => void;
  onSelectTool: (tool: string) => void;
  onSelectColor: (color: string) => void;
  onSelectShape: (shape: string) => void;
  onSelectTexture: (texture: string) => void;
}

const TutorialGuide: React.FC<TutorialGuideProps> = ({
  tutorial,
  onClose,
  onSelectTool,
  onSelectColor,
  onSelectShape,
  onSelectTexture,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    Array(tutorial.steps.length).fill(false)
  );

  // Appliquer les sélections automatiquement à chaque étape
  useEffect(() => {
    const step = tutorial.steps[currentStep];

    if (step.toolToUse) {
      onSelectTool(step.toolToUse);
    }

    if (step.colorToUse) {
      onSelectColor(step.colorToUse);
    }

    if (step.shapeToUse) {
      onSelectShape(step.shapeToUse);
    }

    if (step.textureToUse) {
      onSelectTexture(step.textureToUse);
    }
  }, [
    currentStep,
    onSelectTool,
    onSelectColor,
    onSelectShape,
    onSelectTexture,
    tutorial.steps,
  ]);

  const goToNextStep = () => {
    if (currentStep < tutorial.steps.length - 1) {
      // Marquer l'étape actuelle comme complétée
      const newCompletedSteps = [...completedSteps];
      newCompletedSteps[currentStep] = true;
      setCompletedSteps(newCompletedSteps);

      // Passer à l'étape suivante
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markCurrentStepCompleted = () => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[currentStep] = true;
    setCompletedSteps(newCompletedSteps);
  };

  const isLastStep = currentStep === tutorial.steps.length - 1;
  const currentStepData = tutorial.steps[currentStep];
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gray-800 rounded-xl p-4 border border-white/10 shadow-xl z-40 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <BookOpen className="mr-2 text-pink-500" />
          <h3 className="text-lg font-medium">
            {tutorial.title} - Étape {currentStep + 1}/{tutorial.steps.length}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10"
          aria-label="Fermer le tutoriel"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative h-1 bg-white/10 rounded-full mb-4">
        <div
          className="absolute top-0 left-0 h-1 bg-pink-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium mb-2">{currentStepData.title}</h4>
          <p className="text-sm text-white/70 mb-4">
            {currentStepData.description}
          </p>

          {currentStepData.toolToUse && (
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-2">Outil :</span>
              <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs">
                {currentStepData.toolToUse}
              </span>
            </div>
          )}

          {currentStepData.colorToUse && (
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-2">Couleur :</span>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentStepData.colorToUse }}
              />
            </div>
          )}

          {currentStepData.shapeToUse && (
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-2">Forme :</span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                {currentStepData.shapeToUse}
              </span>
            </div>
          )}

          {currentStepData.textureToUse && (
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-2">Texture :</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                {currentStepData.textureToUse}
              </span>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={markCurrentStepCompleted}
              className={`px-3 py-1 rounded-lg flex items-center text-sm ${
                completedSteps[currentStep]
                  ? "bg-green-500/20 text-green-300"
                  : "bg-white/10 text-white"
              }`}
            >
              <Check size={16} className="mr-1" />
              {completedSteps[currentStep]
                ? "Étape complétée"
                : "Marquer comme complétée"}
            </button>
          </div>
        </div>

        <div>
          {currentStepData.image && (
            <div className="rounded-lg overflow-hidden bg-white/5 h-40 flex items-center justify-center">
              <img
                src={currentStepData.image}
                alt={`Étape ${currentStep + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {!currentStepData.image && (
            <div className="rounded-lg bg-white/5 h-40 flex items-center justify-center text-white/30">
              <span>Pas d'image pour cette étape</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded-lg flex items-center ${
            currentStep === 0
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <ChevronLeft size={16} className="mr-1" />
          Précédent
        </button>

        {!isLastStep ? (
          <button
            onClick={goToNextStep}
            className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 flex items-center"
          >
            Suivant
            <ChevronRight size={16} className="ml-1" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 flex items-center"
          >
            Terminer
            <Check size={16} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TutorialGuide;
