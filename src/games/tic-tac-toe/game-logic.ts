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

// AI Implementation (Minimax)
export function getBestMove(board: Board, player: Player): number {
    const opponent: Player = player === 'X' ? 'O' : 'X';
    
    // First, check if we can win in the next move
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = player;
            if (checkWinner(board).winner === player) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }

    // Second, check if opponent could win and block them
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = opponent;
            if (checkWinner(board).winner === opponent) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }

    // Otherwise use Minimax for best strategic move
    let bestScore = -Infinity;
    let move = -1;

    // Optimization: If center is empty, take it (saves recursion depth)
    if (board[4] === null) return 4;

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = player;
            const score = minimax(board, 0, false, player, opponent);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    
    return move !== -1 ? move : board.findIndex(cell => cell === null);
}

function minimax(board: Board, depth: number, isMaximizing: boolean, aiPlayer: Player, humanPlayer: Player): number {
    const { winner } = checkWinner(board);
    if (winner === aiPlayer) return 10 - depth;
    if (winner === humanPlayer) return depth - 10;
    if (isBoardFull(board)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = aiPlayer;
                const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = humanPlayer;
                const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}
