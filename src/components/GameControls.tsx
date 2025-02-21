import React from 'react';
import { 
  SkipBack, 
  ChevronLeft, 
  ChevronRight, 
  SkipForward,
  Upload,
  Download
} from 'lucide-react';

interface GameControlsProps {
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onImport: () => void;
  onExport: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export function GameControls({
  onFirst,
  onPrev,
  onNext,
  onLast,
  onImport,
  onExport,
  canGoBack,
  canGoForward,
}: GameControlsProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
      <button
        onClick={onFirst}
        disabled={!canGoBack}
        className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SkipBack className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={onPrev}
        disabled={!canGoBack}
        className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={onNext}
        disabled={!canGoForward}
        className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={onLast}
        disabled={!canGoForward}
        className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SkipForward className="w-5 h-5 text-white" />
      </button>
      <div className="w-px h-6 bg-gray-600 mx-2" />
      <button
        onClick={onImport}
        className="p-2 hover:bg-gray-700 rounded"
      >
        <Upload className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={onExport}
        className="p-2 hover:bg-gray-700 rounded"
      >
        <Download className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}