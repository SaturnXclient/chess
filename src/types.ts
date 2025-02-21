export interface ChessGame {
  id: string;
  white: string;
  black: string;
  result: string;
  date: string;
  pgn: string;
}

export interface EngineEvaluation {
  score: number;
  depth: number;
  bestMove: string;
  variation: string[];
}