import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { fabric } from 'fabric';
import JSZip from 'jszip';
import { Palette, Download, Pencil, Eraser, SprayCan as Spray, Layers, Undo, Redo, StickerIcon, Brush } from 'lucide-react';
import NailCanvas from '../components/NailCanvas';

type Tool = 'brush' | 'pencil' | 'spray' | 'eraser';
type Layer = { id: string; name: string; visible: boolean };

const Configurator = () => {
  const [selectedTool, setSelectedTool] = useState<Tool>('brush');
  const [selectedColor, setSelectedColor] = useState('#FF69B4');
  const [brushSize, setBrushSize] = useState(5);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'base', name: 'Fond', visible: true },
    { id: 'design', name: 'Design', visible: true },
    { id: 'effects', name: 'Effets', visible: true }
  ]);
  
  const canvasRefs = useRef<fabric.Canvas[]>([]);

  const colors = [
    '#FF69B4', // Pink
    '#FF1493', // Deep Pink
    '#C71585', // Medium Violet Red
    '#4B0082', // Indigo
    '#9400D3', // Dark Violet
    '#8A2BE2', // Blue Violet
    '#FFD700', // Gold
    '#FF4500', // Orange Red
  ];

  const tools = [
    { id: 'brush' as Tool, icon: <Brush />, name: 'Pinceau' },
    { id: 'pencil' as Tool, icon: <Pencil />, name: 'Crayon' },
    { id: 'spray' as Tool, icon: <Spray />, name: 'Aérographe' },
    { id: 'eraser' as Tool, icon: <Eraser />, name: 'Gomme' },
  ];

  const stickers = [
    { id: 'flower', name: 'Fleur', url: 'https://example.com/flower.svg' },
    { id: 'star', name: 'Étoile', url: 'https://example.com/star.svg' },
    { id: 'heart', name: 'Cœur', url: 'https://example.com/heart.svg' },
  ];

  const handleCanvasReady = (canvas: fabric.Canvas, index: number) => {
    canvasRefs.current[index] = canvas;
  };

  const handleUndo = () => {
    canvasRefs.current.forEach(canvas => {
      if (canvas) {
        canvas.undo();
      }
    });
  };

  const handleRedo = () => {
    canvasRefs.current.forEach(canvas => {
      if (canvas) {
        canvas.redo();
      }
    });
  };

  const handleAddSticker = (stickerId: string) => {
    const sticker = stickers.find(s => s.id === stickerId);
    if (sticker) {
      canvasRefs.current.forEach(canvas => {
        if (canvas) {
          fabric.loadSVGFromURL(sticker.url, (objects, options) => {
            const svg = fabric.util.groupSVGElements(objects, options);
            svg.scale(0.5);
            canvas.add(svg);
          });
        }
      });
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(layers.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleExport = () => {
    const zip = new JSZip();
    canvasRefs.current.forEach((canvas, index) => {
      if (canvas) {
        const dataURL = canvas.toDataURL();
        const base64Data = dataURL.split(',')[1];
        zip.file(`nail-${index + 1}.png`, base64Data, { base64: true });
      }
    });
    
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'nail-designs.zip';
      link.click();
    });
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tools Panel */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
            <h3 className="text-lg font-medium mb-4">Outils</h3>
            <div className="space-y-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-full p-2 rounded-lg flex items-center space-x-2 transition-all ${
                    selectedTool === tool.id
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/5 hover:bg-white/10'
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
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Couleurs</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      selectedColor === color ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
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
            <div className="flex justify-end mb-4 space-x-2">
              <button
                onClick={handleUndo}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <Undo />
              </button>
              <button
                onClick={handleRedo}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <Redo />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, index) => (
                <NailCanvas
                  key={index}
                  width={120}
                  height={200}
                  selectedTool={selectedTool}
                  selectedColor={selectedColor}
                  brushSize={brushSize}
                  onCanvasReady={(canvas) => handleCanvasReady(canvas, index)}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Layers & Stickers Panel */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
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
                      layer.visible ? 'bg-white/10' : 'bg-white/5'
                    }`}
                  >
                    <span>{layer.name}</span>
                    <div className={`w-4 h-4 rounded-full ${
                      layer.visible ? 'bg-pink-500' : 'bg-gray-500'
                    }`} />
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
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleExport}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
          >
            <Download />
            <span>Exporter les Designs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configurator;