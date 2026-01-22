export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
    type: PieceType;
    color: PieceColor;
    hasMoved?: boolean;
}

export type Board = (Piece | null)[][];

export interface Position {
    row: number;
    col: number;
}

export interface Move {
    from: Position;
    to: Position;
    piece: Piece;
    captured?: Piece;
    isCastling?: boolean;
    isEnPassant?: boolean;
    promotion?: PieceType;
}

export type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw';

export interface GameState {
    board: Board;
    turn: PieceColor;
    status: GameStatus;
    selectedPosition: Position | null;
    possibleMoves: Position[];
    history: Move[];
    winner?: PieceColor;
    inCheck?: PieceColor;
}

export type GameMode = 'human-vs-human' | 'human-vs-cpu' | 'cpu-vs-cpu';
