import React from 'react';
import type { ChessGame } from '../types';

interface GamesListProps {
  games: ChessGame[];
  onGameSelect: (game: ChessGame) => void;
}

export function GamesList({ games, onGameSelect }: GamesListProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Recent Games</h2>
      </div>
      <div className="divide-y divide-gray-700">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onGameSelect(game)}
            className="w-full p-4 text-left hover:bg-gray-700 transition-colors"
          >
            <div className="text-white font-medium">
              {game.white} vs {game.black}
            </div>
            <div className="text-sm text-gray-400">
              {game.result} • {new Date(game.date).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}