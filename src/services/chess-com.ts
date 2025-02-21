import axios from 'axios';
import type { ChessGame } from '../types';

const BASE_URL = 'https://api.chess.com/pub';

export async function fetchUserGames(username: string): Promise<ChessGame[]> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7).replace('-', '/');
    const response = await axios.get(`${BASE_URL}/player/${username}/games/${currentMonth}`);
    
    return response.data.games
      .slice(-10) // Get last 10 games
      .map((game: any) => ({
        id: game.uuid,
        white: game.white.username,
        black: game.black.username,
        result: game.white.result === 'win' ? '1-0' : game.black.result === 'win' ? '0-1' : '½-½',
        date: new Date(game.end_time * 1000).toISOString(),
        pgn: game.pgn
      }));
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}