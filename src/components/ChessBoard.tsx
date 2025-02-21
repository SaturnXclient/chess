import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import useMeasure from 'react-use-measure';
import * as Tone from 'tone';

// Initialize Tone.js synth and effects
const synth = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.2,
    release: 1
  }
}).toDestination();

const reverb = new Tone.Reverb({
  decay: 4,
  wet: 0.5
}).toDestination();

synth.connect(reverb);

// Sound mapping for different piece types
const pieceSounds = {
  p: 'C4',
  n: 'D4',
  b: 'E4',
  r: 'F4',
  q: 'G4',
  k: 'A4'
};

interface ChessBoardProps {
  position?: string;
  onMove?: (move: any) => void;
  orientation?: 'white' | 'black';
  moveQuality?: {
    [key: string]: 'brilliant' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  };
  lastMove?: { from: string; to: string };
}

export function ChessBoard({ 
  position = 'start', 
  onMove, 
  orientation = 'white',
  moveQuality = {},
  lastMove
}: ChessBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [ref, bounds] = useMeasure();
  const [showMoveIndicator, setShowMoveIndicator] = useState(false);
  
  const squareSize = bounds.width / 8;

  useEffect(() => {
    const newGame = new Chess();
    if (position !== 'start') {
      newGame.load(position);
    }
    setGame(newGame);
  }, [position]);

  useEffect(() => {
    if (lastMove) {
      setShowMoveIndicator(true);
      const timer = setTimeout(() => setShowMoveIndicator(false), 1000);
      
      // Play sound for moved piece
      const piece = game.get(lastMove.to);
      if (piece) {
        const note = pieceSounds[piece.type.toLowerCase()];
        synth.triggerAttackRelease(note, '0.2');
      }
      
      return () => clearTimeout(timer);
    }
  }, [lastMove, game]);

  const getMoveQualityClass = (quality?: string) => {
    switch (quality) {
      case 'brilliant': return 'move-quality-brilliant';
      case 'great': return 'move-quality-great';
      case 'good': return 'move-quality-good';
      case 'inaccuracy': return 'move-quality-inaccuracy';
      case 'mistake': return 'move-quality-mistake';
      case 'blunder': return 'move-quality-blunder';
      default: return '';
    }
  };

  const springProps = useSpring({
    opacity: showMoveIndicator ? 1 : 0,
    config: { tension: 300, friction: 20 }
  });

  function onSquareClick(square: string) {
    if (selectedSquare === null) {
      const moves = game.moves({ square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
      }
    } else {
      const move = game.move({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });

      if (move) {
        onMove?.(move);
      }
      setSelectedSquare(null);
    }
  }

  const customSquareStyles = {
    ...(lastMove ? {
      [lastMove.from]: {
        background: 'radial-gradient(circle at center, rgba(255, 255, 0, 0.2), transparent)',
        animation: 'cosmicPulse 2s infinite'
      },
      [lastMove.to]: {
        background: 'radial-gradient(circle at center, rgba(255, 255, 0, 0.3), transparent)',
        animation: 'cosmicPulse 2s infinite'
      },
    } : {}),
  };

  return (
    <div ref={ref} className="relative w-full max-w-[600px] aspect-square">
      <div className="absolute inset-0 rounded-lg cosmic-border cosmic-glow">
        <Chessboard
          position={game.fen()}
          onSquareClick={onSquareClick}
          customBoardStyle={{
            borderRadius: '8px',
            background: 'transparent',
          }}
          customDarkSquareStyle={{ 
            background: 'rgba(76, 0, 255, 0.3)',
            transition: 'all 0.3s ease'
          }}
          customLightSquareStyle={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease'
          }}
          customSquareStyles={customSquareStyles}
          orientation={orientation}
        />
      </div>

      <AnimatePresence>
        {Object.entries(moveQuality).map(([square, quality]) => (
          <motion.div
            key={square}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute ${getMoveQualityClass(quality)} cosmic-glow`}
            style={{
              width: squareSize / 2,
              height: squareSize / 2,
              borderRadius: '50%',
              top: `${(parseInt(square[1]) - 1) * squareSize + squareSize / 4}px`,
              left: `${(square.charCodeAt(0) - 97) * squareSize + squareSize / 4}px`,
              zIndex: 20,
            }}
          />
        ))}
      </AnimatePresence>

      {lastMove && (
        <animated.div
          style={{
            ...springProps,
            position: 'absolute',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="moveArrow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#4c00ff', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#ff00ea', stopOpacity: 0.8 }} />
              </linearGradient>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="url(#moveArrow)"
                />
              </marker>
            </defs>
            <line
              x1={`${(lastMove.from.charCodeAt(0) - 97 + 0.5) * squareSize}`}
              y1={`${(8 - parseInt(lastMove.from[1]) + 0.5) * squareSize}`}
              x2={`${(lastMove.to.charCodeAt(0) - 97 + 0.5) * squareSize}`}
              y2={`${(8 - parseInt(lastMove.to[1]) + 0.5) * squareSize}`}
              stroke="url(#moveArrow)"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        </animated.div>
      )}
    </div>
  );
}