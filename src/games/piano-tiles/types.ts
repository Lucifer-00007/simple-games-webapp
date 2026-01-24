export type TileStatus = 'pending' | 'tapped' | 'missed';

export interface Tile {
    id: number;
    col: number;
    row: number;
    status: TileStatus;
}

export type GameStatus = 'idle' | 'playing' | 'gameOver';

export interface GameState {
    tiles: Tile[];
    score: number;
    status: GameStatus;
    speed: number;
    lastRowTime: number;
}

export const PIANO_CONFIG = {
    COLS: 4,
    ROWS: 5,
    INITIAL_SPEED: 3,
    SPEED_INCREMENT: 0.05,
    TILE_SPAWN_INTERVAL: 1000,
};
