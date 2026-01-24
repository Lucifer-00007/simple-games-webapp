// Simon Says game types

export type GameStatus = 'idle' | 'showingSequence' | 'playerTurn' | 'gameOver';
export type Color = 'red' | 'green' | 'blue' | 'yellow';

export interface GameState {
    sequence: Color[];
    playerSequence: Color[];
    status: GameStatus;
    score: number;
    highScore: number;
    activeColor: Color | null;
    currentShowIndex: number;
}

export interface GameConfig {
    colors: Color[];
    showDelay: number;
    pauseDelay: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    colors: ['red', 'green', 'blue', 'yellow'],
    showDelay: 500,
    pauseDelay: 200,
};
