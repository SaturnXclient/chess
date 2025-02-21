import { EventEmitter } from './EventEmitter';

class StockfishService extends EventEmitter {
  private worker: Worker | null = null;
  private currentDepth: number = 20;
  
  constructor() {
    super();
    this.initializeWorker();
  }

  private initializeWorker() {
    try {
      // Create a blob with the worker URL to avoid the '<' token error
      const workerBlob = new Blob(
        ['importScripts("https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js");'],
        { type: 'application/javascript' }
      );
      const workerUrl = URL.createObjectURL(workerBlob);
      this.worker = new Worker(workerUrl);
      
      this.worker.onmessage = (e) => {
        const line = e.data;
        
        if (line.startsWith('info depth')) {
          const matches = line.match(/score cp (-?\d+)/);
          const depthMatch = line.match(/depth (\d+)/);
          const pv = line.match(/pv (.+)$/);
          
          if (matches && depthMatch && pv) {
            const score = parseInt(matches[1]) / 100;
            const depth = parseInt(depthMatch[1]);
            const moves = pv[1].split(' ');
            
            this.emit('evaluation', {
              score,
              depth,
              bestLine: moves
            });
          }
        }
      };

      this.worker.postMessage('uci');
      this.worker.postMessage('isready');
    } catch (error) {
      console.error('Failed to initialize Stockfish worker:', error);
    }
  }

  analyze(fen: string, depth: number = this.currentDepth) {
    if (!this.worker) {
      this.initializeWorker();
      return;
    }
    
    this.currentDepth = depth;
    this.worker.postMessage('stop');
    this.worker.postMessage('position fen ' + fen);
    this.worker.postMessage('go depth ' + depth);
  }

  setDepth(depth: number) {
    this.currentDepth = depth;
  }

  stop() {
    if (!this.worker) return;
    this.worker.postMessage('stop');
  }

  destroy() {
    if (!this.worker) return;
    this.worker.terminate();
    this.worker = null;
  }
}

export const stockfish = new StockfishService();