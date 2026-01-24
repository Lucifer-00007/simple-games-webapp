import { Board, GameState, PieceColor, PieceType, Position } from './types';

const BOARD_SIZE = 8;

export function createInitialBoard(): Board {
    const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

    const setupRow = (row: number, color: PieceColor) => {
        const backRow = color === 'white' ? 7 : 0;
        const pawnRow = color === 'white' ? 6 : 1;

        // Pawns
        for (let i = 0; i < BOARD_SIZE; i++) {
            board[pawnRow][i] = { type: 'pawn', color, hasMoved: false };
        }

        // Back row
        const pieces: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let i = 0; i < BOARD_SIZE; i++) {
            board[backRow][i] = { type: pieces[i], color, hasMoved: false };
        }
    };

    setupRow(0, 'black');
    setupRow(7, 'white');

    return board;
}

export function createInitialState(): GameState {
    return {
        board: createInitialBoard(),
        turn: 'white',
        status: 'playing',
        selectedPosition: null,
        possibleMoves: [],
        history: [],
    };
}

function isValidPos(pos: Position): boolean {
    return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

function isOpponent(board: Board, pos: Position, color: PieceColor): boolean {
    const piece = board[pos.row][pos.col];
    return piece !== null && piece.color !== color;
}

function isEmpty(board: Board, pos: Position): boolean {
    return board[pos.row][pos.col] === null;
}

// Basic move generation (pseudo-legal moves)
function getPseudoLegalMoves(board: Board, pos: Position): Position[] {
    const piece = board[pos.row][pos.col];
    if (!piece) return [];

    const moves: Position[] = [];
    const { type, color } = piece;
    const direction = color === 'white' ? -1 : 1;

    const addMove = (r: number, c: number) => {
        const target: Position = { row: r, col: c };
        if (isValidPos(target)) {
            if (isEmpty(board, target)) {
                moves.push(target);
                return true; // Continue sliding
            } else if (isOpponent(board, target, color)) {
                moves.push(target);
                return false; // Stop sliding
            }
        }
        return false; // Stop sliding (blocked or out of bounds)
    };

    if (type === 'pawn') {
        // Forward move
        if (isValidPos({ row: pos.row + direction, col: pos.col }) && isEmpty(board, { row: pos.row + direction, col: pos.col })) {
            moves.push({ row: pos.row + direction, col: pos.col });
            // Double move
            if (!piece.hasMoved && 
                isValidPos({ row: pos.row + direction * 2, col: pos.col }) && 
                isEmpty(board, { row: pos.row + direction * 2, col: pos.col })) {
                moves.push({ row: pos.row + direction * 2, col: pos.col });
            }
        }
        // Captures
        const captures = [{ r: pos.row + direction, c: pos.col - 1 }, { r: pos.row + direction, c: pos.col + 1 }];
        for (const cap of captures) {
            if (isValidPos({ row: cap.r, col: cap.c }) && isOpponent(board, { row: cap.r, col: cap.c }, color)) {
                moves.push({ row: cap.r, col: cap.c });
            }
        }
    } else if (type === 'knight') {
        const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of offsets) {
            addMove(pos.row + dr, pos.col + dc);
        }
    } else if (type === 'king') {
        const offsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        for (const [dr, dc] of offsets) {
            addMove(pos.row + dr, pos.col + dc);
        }
    } else {
        // Sliding pieces (Rook, Bishop, Queen)
        const directions = [];
        if (type === 'rook' || type === 'queen') {
            directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        }
        if (type === 'bishop' || type === 'queen') {
            directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        }

        for (const [dr, dc] of directions) {
            let r = pos.row + dr;
            let c = pos.col + dc;
            while (isValidPos({ row: r, col: c })) {
                if (!addMove(r, c)) break; // Stop if blocked or captured
                r += dr;
                c += dc;
            }
        }
    }

    return moves;
}

// Find King position
function findKing(board: Board, color: PieceColor): Position | null {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece && piece.type === 'king' && piece.color === color) {
                return { row: r, col: c };
            }
        }
    }
    return null;
}

// Check if square is under attack
function isSquareUnderAttack(board: Board, pos: Position, attackerColor: PieceColor): boolean {
    // Naive approach: generate all pseudo moves for attacker and check if pos is target
    // Optimized: check from pos perspective (e.g. check if a knight is attacking this square)
    
    // Check Knight attacks
    const knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of knightOffsets) {
        const r = pos.row + dr, c = pos.col + dc;
        if (isValidPos({row: r, col: c})) {
            const piece = board[r][c];
            if (piece && piece.type === 'knight' && piece.color === attackerColor) return true;
        }
    }

    // Check sliding pieces (Queen, Rook, Bishop)
    const directions = [
        { dr: -1, dc: 0, types: ['rook', 'queen'] },
        { dr: 1, dc: 0, types: ['rook', 'queen'] },
        { dr: 0, dc: -1, types: ['rook', 'queen'] },
        { dr: 0, dc: 1, types: ['rook', 'queen'] },
        { dr: -1, dc: -1, types: ['bishop', 'queen'] },
        { dr: -1, dc: 1, types: ['bishop', 'queen'] },
        { dr: 1, dc: -1, types: ['bishop', 'queen'] },
        { dr: 1, dc: 1, types: ['bishop', 'queen'] }
    ];

    for (const { dr, dc, types } of directions) {
        let r = pos.row + dr;
        let c = pos.col + dc;
        while (isValidPos({ row: r, col: c })) {
            const piece = board[r][c];
            if (piece) {
                if (piece.color === attackerColor && (types as PieceType[]).includes(piece.type)) return true;
                break;
            }
            r += dr;
            c += dc;
        }
    }

    // Check Pawn attacks
    const pawnDirection = attackerColor === 'white' ? -1 : 1;
    // Pawns attack diagonally forward
    const pawnAttacks = [{ r: pos.row - pawnDirection, c: pos.col - 1 }, { r: pos.row - pawnDirection, c: pos.col + 1 }];
    for (const att of pawnAttacks) {
        if (isValidPos({ row: att.r, col: att.c })) {
            const piece = board[att.r][att.c];
            if (piece && piece.type === 'pawn' && piece.color === attackerColor) return true;
        }
    }

    // Check King attacks (neighbors)
    for (let r = pos.row - 1; r <= pos.row + 1; r++) {
        for (let c = pos.col - 1; c <= pos.col + 1; c++) {
            if (r === pos.row && c === pos.col) continue;
            if (isValidPos({ row: r, col: c })) {
                const piece = board[r][c];
                if (piece && piece.type === 'king' && piece.color === attackerColor) return true;
            }
        }
    }

    return false;
}

// Check if King is in check
export function isInCheck(board: Board, color: PieceColor): boolean {
    const kingPos = findKing(board, color);
    if (!kingPos) return false; // Should not happen
    const opponentColor = color === 'white' ? 'black' : 'white';
    return isSquareUnderAttack(board, kingPos, opponentColor);
}

// Get all legal moves
export function getLegalMoves(board: Board, pos: Position): Position[] {
    const pseudoMoves = getPseudoLegalMoves(board, pos);
    const legalMoves: Position[] = [];
    const piece = board[pos.row][pos.col];
    if (!piece) return [];

    for (const move of pseudoMoves) {
        // Simulate move
        const newBoard = board.map(row => [...row]);
        newBoard[move.row][move.col] = newBoard[pos.row][pos.col];
        newBoard[pos.row][pos.col] = null;

        if (!isInCheck(newBoard, piece.color)) {
            legalMoves.push(move);
        }
    }
    
    return legalMoves;
}

export function getAllLegalMoves(board: Board, color: PieceColor): { from: Position, to: Position }[] {
    const moves: { from: Position, to: Position }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece && piece.color === color) {
                const pieceMoves = getLegalMoves(board, { row: r, col: c });
                pieceMoves.forEach(to => moves.push({ from: { row: r, col: c }, to }));
            }
        }
    }
    return moves;
}

export function makeMove(state: GameState, from: Position, to: Position): GameState {
    const board = state.board.map(row => [...row]); // Deepish copy
    const piece = board[from.row][from.col];
    if (!piece) return state;

    const captured = board[to.row][to.col];
    
    // Move piece
    board[to.row][to.col] = { ...piece, hasMoved: true };
    board[from.row][from.col] = null;

    // Promotion (Queen only for simplicity)
    if (piece.type === 'pawn') {
        if ((piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 7)) {
            board[to.row][to.col]!.type = 'queen';
        }
    }

    const nextTurn = state.turn === 'white' ? 'black' : 'white';
    
    // Check game status
    let status: GameState['status'] = 'playing';
    let winner: PieceColor | undefined;

    const nextMoves = getAllLegalMoves(board, nextTurn);
    if (nextMoves.length === 0) {
        if (isInCheck(board, nextTurn)) {
            status = 'checkmate';
            winner = state.turn;
        } else {
            status = 'stalemate';
        }
    } else if (isInCheck(board, nextTurn)) {
        // Just check warning, not game over
    }

    return {
        ...state,
        board,
        turn: nextTurn,
        status,
        winner,
        selectedPosition: null,
        possibleMoves: [],
        history: [...state.history, { from, to, piece, captured: captured || undefined }],
        inCheck: isInCheck(board, nextTurn) ? nextTurn : undefined,
    };
}

// Simple AI Evaluation
const PIECE_VALUES = {
    pawn: 10,
    knight: 30,
    bishop: 30,
    rook: 50,
    queen: 90,
    king: 900
};

function evaluateBoard(board: Board): number {
    let score = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece) {
                const value = PIECE_VALUES[piece.type];
                score += piece.color === 'white' ? value : -value;
            }
        }
    }
    return score;
}

// Minimax with Alpha-Beta Pruning
export function getBestMove(state: GameState, depth: number): { from: Position, to: Position } | null {
    const moves = getAllLegalMoves(state.board, state.turn);
    if (moves.length === 0) return null;

    let bestMove = null;
    let bestValue = state.turn === 'white' ? -Infinity : Infinity;

    // Shuffle moves for randomness in equal positions
    moves.sort(() => Math.random() - 0.5);

    for (const move of moves) {
        const newState = makeMove(state, move.from, move.to);
        // Simple 1-ply lookahead + evaluation for responsiveness
        // For a better AI, we'd recurse here. Given constraints, let's do depth 2 or 3 depending on performance.
        // Actually, let's keep it simple: 1 depth search (greedy) or 2 if fast.
        
        const value = minimax(newState, depth - 1, -Infinity, Infinity, newState.turn === 'white');
        
        if (state.turn === 'white') {
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        } else {
            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }
    }

    return bestMove;
}

function minimax(state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || state.status !== 'playing') {
        return evaluateBoard(state.board);
    }

    const moves = getAllLegalMoves(state.board, state.turn);
    if (moves.length === 0) {
        if (isInCheck(state.board, state.turn)) {
            return isMaximizing ? -10000 : 10000; // Checkmate
        }
        return 0; // Stalemate
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const newState = makeMove(state, move.from, move.to);
            const evalScore = minimax(newState, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const newState = makeMove(state, move.from, move.to);
            const evalScore = minimax(newState, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}
