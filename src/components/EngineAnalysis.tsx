import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Zap, AlertTriangle, Check } from 'lucide-react';
import { stockfish } from '../services/stockfish';
import { useSpring, animated } from '@react-spring/web';

interface EngineAnalysisProps {
  fen: string;
  depth?: number;
  onDepthChange?: (depth: number) => void;
}

export function EngineAnalysis({ fen, depth = 20, onDepthChange }: EngineAnalysisProps) {
  const [evaluation, setEvaluation] = useState<number | null>(null);
  const [bestLine, setBestLine] = useState<string[]>([]);
  const [currentDepth, setCurrentDepth] = useState(0);

  const barHeight = useSpring({
    height: evaluation !== null ? `${Math.min(Math.max((evaluation + 4) * 10, 0), 100)}%` : '50%',
    config: { tension: 120, friction: 14 }
  });

  const getEvaluationColor = (score: number) => {
    if (score > 2) return 'rgb(68, 214, 100)';
    if (score < -2) return 'rgb(219, 87, 87)';
    return 'rgb(136, 204, 103)';
  };

  useEffect(() => {
    const handleEvaluation = (data: { score: number; depth: number; bestLine: string[] }) => {
      setEvaluation(data.score);
      setBestLine(data.bestLine);
      setCurrentDepth(data.depth);
    };

    stockfish.on('evaluation', handleEvaluation);
    stockfish.analyze(fen, depth);

    return () => {
      stockfish.off('evaluation', handleEvaluation);
      stockfish.stop();
    };
  }, [fen, depth]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Engine Analysis</h3>
          </div>
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min="1"
              max="30"
              value={depth}
              onChange={(e) => {
                const newDepth = Number(e.target.value);
                onDepthChange?.(newDepth);
                stockfish.setDepth(newDepth);
              }}
              className="w-32 accent-yellow-400"
            />
            <span className="text-sm text-gray-400 font-medium">
              Depth: {currentDepth}/{depth}
            </span>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {evaluation !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold" style={{ color: getEvaluationColor(evaluation) }}>
                  {evaluation > 0 ? '+' : ''}{evaluation.toFixed(2)}
                </div>
                <div className="relative h-16 w-48 bg-gray-700 rounded-lg overflow-hidden">
                  <animated.div
                    style={{
                      ...barHeight,
                      backgroundColor: getEvaluationColor(evaluation),
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Best line</h4>
                <div className="flex flex-wrap gap-2">
                  {bestLine.slice(0, 5).map((move, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-3 py-1 bg-gray-700 rounded-md text-sm font-medium text-white"
                    >
                      {move}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium text-yellow-400">Analysis</h4>
                <div className="grid grid-cols-1 gap-3">
                  {evaluation > 1.5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-green-400 bg-gray-700/50 p-3 rounded-lg"
                    >
                      <Check className="w-5 h-5" />
                      <span className="text-sm">Strong advantage for White. Look for tactical opportunities.</span>
                    </motion.div>
                  )}
                  {evaluation < -1.5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-400 bg-gray-700/50 p-3 rounded-lg"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-sm">Black has the advantage. Maintain defensive posture.</span>
                    </motion.div>
                  )}
                  {evaluation > -1.5 && evaluation < 1.5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-blue-400 bg-gray-700/50 p-3 rounded-lg"
                    >
                      <Check className="w-5 h-5" />
                      <span className="text-sm">Position is balanced. Focus on strategic improvements.</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}