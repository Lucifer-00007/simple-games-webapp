import { Board, Player, GameState, GameStatus, WIN_CONDITIONS, Cell } from './types';

// Create initial empty board
export function createEmptyBoard(): Board {
    return Array(9).fill(null);
}

// Create initial game state
export function createInitialState(): GameState {
    return {
        board: createEmptyBoard(),
        currentPlayer: 'X',
        status: 'playing',
        winner: null,
        winningLine: null,
    };
}

// Check for a winner
export function checkWinner(board: Board): { winner: Player | null; winningLine: number[] | null } {
    for (const condition of WIN_CONDITIONS) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], winningLine: condition };
        }
    }
    return { winner: null, winningLine: null };
}

// Check if board is full (draw condition)
export function isBoardFull(board: Board): boolean {
    return board.every((cell) => cell !== null);
}

// Get game status
export function getGameStatus(board: Board): {
    status: GameStatus;
    winner: Player | null;
    winningLine: number[] | null;
} {
    const { winner, winningLine } = checkWinner(board);

    if (winner) {
        return { status: 'won', winner, winningLine };
    }

    if (isBoardFull(board)) {
        return { status: 'draw', winner: null, winningLine: null };
    }

    return { status: 'playing', winner: null, winningLine: null };
}

// Make a move and return new game state
export function makeMove(state: GameState, index: number): GameState {
    // Can't move if game is over or cell is occupied
    if (state.status !== 'playing' || state.board[index] !== null) {
        return state;
    }

    // Create new board with the move
    const newBoard = [...state.board];
    newBoard[index] = state.currentPlayer;

    // Check game status after move
    const { status, winner, winningLine } = getGameStatus(newBoard);

    // Determine next player
    const nextPlayer: Player = state.currentPlayer === 'X' ? 'O' : 'X';

    return {
        board: newBoard,
        currentPlayer: status === 'playing' ? nextPlayer : state.currentPlayer,
        status,
        winner,
        winningLine,
    };
}
