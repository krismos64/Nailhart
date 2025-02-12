import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface NailCanvasProps {
  width: number;
  height: number;
  selectedTool: string;
  selectedColor: string;
  brushSize: number;
  onCanvasReady: (canvas: fabric.Canvas) => void;
  index: number;
}

const NailCanvas: React.FC<NailCanvasProps> = ({
  width,
  height,
  selectedTool,
  selectedColor,
  brushSize,
  onCanvasReady,
  index
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        isDrawingMode: true,
        backgroundColor: 'transparent'
      });

      // Create nail shape
      const nailPath = new fabric.Path('M 50,0 Q 100,0 100,50 L 100,150 Q 100,200 50,200 Q 0,200 0,150 L 0,50 Q 0,0 50,0 z', {
        left: 0,
        top: 0,
        fill: '#fff3f3',
        selectable: false,
        evented: false,
        scaleX: width / 100,
        scaleY: height / 200
      });

      canvas.add(nailPath);
      canvas.renderAll();

      fabricRef.current = canvas;
      onCanvasReady(canvas);

      // Initialize brush
      const brush = new fabric.PencilBrush(canvas);
      brush.color = selectedColor;
      brush.width = brushSize;
      canvas.freeDrawingBrush = brush;
    }
  }, []);

  useEffect(() => {
    if (fabricRef.current) {
      const canvas = fabricRef.current;
      canvas.isDrawingMode = true;

      switch (selectedTool) {
        case 'brush':
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          break;
        case 'pencil':
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          break;
        case 'spray':
          canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
          break;
        case 'eraser':
          canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
          break;
      }

      canvas.freeDrawingBrush.color = selectedColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [selectedTool, selectedColor, brushSize]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-t-full border-2 border-white/10" />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-white/70">
        Ongle {index + 1}
      </div>
    </div>
  );
};

export default NailCanvas;