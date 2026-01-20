// Dice Roll game types

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface RollRecord {
    rollNumber: number;
    value: DiceValue;
}

export interface GameState {
    currentValue: DiceValue | null;
    isRolling: boolean;
    history: RollRecord[];
    totalRolls: number;
}

export const DICE_FACES: Record<DiceValue, string> = {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅',
};
