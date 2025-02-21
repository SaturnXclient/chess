import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';
import { GameControls } from './components/GameControls';
import { EngineAnalysis } from './components/EngineAnalysis';
import { GamesList } from './components/GamesList';
import { fetchUserGames } from './services/chess-com';
import { Search, ChevronRight as ChessKnight } from 'lucide-react';
import type { ChessGame } from './types';

function App() {
  const [username, setUsername] = useState('');
  const [games, setGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [currentGame, setCurrentGame] = useState<Chess | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moves, setMoves] = useState<string[]>([]);
  const [engineDepth, setEngineDepth] = useState(20);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [moveQualities, setMoveQualities] = useState<{[key: string]: string}>({});

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const fetchedGames = await fetchUserGames(username);
      setGames(fetchedGames);
    } catch (err) {
      setError('Failed to fetch games. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelect = (game: ChessGame) => {
    const chess = new Chess();
    chess.loadPgn(game.pgn);
    setCurrentGame(chess);
    setMoves(chess.history());
    setCurrentMoveIndex(0);
    setMoveQualities({});
  };

  const getCurrentPosition = useCallback(() => {
    if (!currentGame) return 'start';
    
    const chess = new Chess();
    const movesToPlay = moves.slice(0, currentMoveIndex);
    movesToPlay.forEach(move => chess.move(move));
    
    return chess.fen();
  }, [currentGame, moves, currentMoveIndex]);

  // Memoize the analyzeMoveQuality function
  const analyzeMoveQuality = useCallback((score: number) => {
    if (score > 3) return 'brilliant';
    if (score > 2) return 'great';
    if (score > 1) return 'good';
    if (score > -1) return 'inaccuracy';
    if (score > -2) return 'mistake';
    return 'blunder';
  }, []);

  useEffect(() => {
    if (!currentGame) return;
    
    const chess = new Chess();
    const movesToPlay = moves.slice(0, currentMoveIndex);
    movesToPlay.forEach(move => chess.move(move));
    
    if (movesToPlay.length > 0) {
      const lastMoveObj = chess.history({ verbose: true }).pop();
      if (lastMoveObj) {
        setLastMove({ from: lastMoveObj.from, to: lastMoveObj.to });
        // Only update move qualities when a new move is made
        const quality = analyzeMoveQuality(Math.random() * 4 - 2);
        setMoveQualities(prev => ({
          ...prev,
          [lastMoveObj.to]: quality
        }));
      }
    } else {
      setLastMove(null);
    }
  }, [currentGame, moves, currentMoveIndex, analyzeMoveQuality]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChessKnight className="w-8 h-8 text-yellow-400" />
              <h1 className="text-2xl font-bold">Chess Analysis Pro</h1>
            </div>
            <form onSubmit={handleUsernameSubmit} className="flex gap-2">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Chess.com username"
                  className="pl-10 pr-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Analyze Games'}
              </button>
            </form>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex flex-col items-center">
              <ChessBoard
                position={getCurrentPosition()}
                onMove={(move) => {
                  if (currentGame && currentMoveIndex < moves.length) {
                    setCurrentMoveIndex(prev => prev + 1);
                  }
                }}
                moveQuality={moveQualities}
                lastMove={lastMove}
              />
              <div className="mt-4 w-full max-w-[600px]">
                <GameControls
                  onFirst={() => setCurrentMoveIndex(0)}
                  onPrev={() => setCurrentMoveIndex(prev => Math.max(0, prev - 1))}
                  onNext={() => setCurrentMoveIndex(prev => Math.min(moves.length, prev + 1))}
                  onLast={() => setCurrentMoveIndex(moves.length)}
                  onImport={() => {/* TODO */}}
                  onExport={() => {
                    if (currentGame) {
                      const pgn = currentGame.pgn();
                      navigator.clipboard.writeText(pgn);
                    }
                  }}
                  canGoBack={currentMoveIndex > 0}
                  canGoForward={currentMoveIndex < moves.length}
                />
              </div>
            </div>

            <EngineAnalysis
              fen={getCurrentPosition()}
              depth={engineDepth}
              onDepthChange={setEngineDepth}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GamesList
              games={games}
              onGameSelect={handleGameSelect}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;