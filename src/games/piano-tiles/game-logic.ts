import { GameState, Tile, PIANO_CONFIG } from './types';

export function createInitialState(): GameState {
    return {
        tiles: [],
        score: 0,
        status: 'idle',
        speed: PIANO_CONFIG.INITIAL_SPEED,
        lastRowTime: 0,
    };
}

export function spawnRow(state: GameState): GameState {
    const col = Math.floor(Math.random() * PIANO_CONFIG.COLS);
    const newTile: Tile = {
        id: Date.now(),
        col,
        row: -1, // Start just above visible rows
        status: 'pending',
    };
    return {
        ...state,
        tiles: [...state.tiles, newTile],
        lastRowTime: Date.now(),
    };
}

export function updateTiles(state: GameState): GameState {
    if (state.status !== 'playing') return state;

    let newState = { ...state };
    let gameOver = false;

    newState.tiles = state.tiles.map(tile => {
        const newRow = tile.row + (state.speed / 60); // Assuming 60fps
        
        // If tile crosses bottom without being tapped
        if (newRow >= PIANO_CONFIG.ROWS && tile.status === 'pending') {
            gameOver = true;
        }
        
        return { ...tile, row: newRow };
    }).filter(tile => tile.row < PIANO_CONFIG.ROWS + 1);

    if (gameOver) {
        newState.status = 'gameOver';
    }

    return newState;
}

export function tapTile(state: GameState, tileId: number): GameState {
    if (state.status !== 'playing') return state;

    const tileIndex = state.tiles.findIndex(t => t.id === tileId);
    if (tileIndex === -1 || state.tiles[tileIndex].status !== 'pending') return state;

    const newTiles = [...state.tiles];
    newTiles[tileIndex] = { ...newTiles[tileIndex], status: 'tapped' };

    return {
        ...state,
        tiles: newTiles,
        score: state.score + 1,
        speed: state.speed + PIANO_CONFIG.SPEED_INCREMENT,
    };
}
