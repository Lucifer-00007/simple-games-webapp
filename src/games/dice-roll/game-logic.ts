import { DiceValue, RollRecord, GameState } from './types';

// Roll the dice
export function rollDice(): DiceValue {
    return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

// Create initial state
export function createInitialState(): GameState {
    return {
        currentValue: null,
        isRolling: false,
        history: [],
        totalRolls: 0,
    };
}

// Update state after a roll
export function updateStateWithRoll(state: GameState, value: DiceValue): GameState {
    const newRoll: RollRecord = {
        rollNumber: state.totalRolls + 1,
        value,
    };

    return {
        currentValue: value,
        isRolling: false,
        history: [newRoll, ...state.history].slice(0, 10), // Keep last 10 rolls
        totalRolls: state.totalRolls + 1,
    };
}

// Get statistics from history
export function getStatistics(history: RollRecord[]): Record<DiceValue, number> {
    const stats: Record<DiceValue, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    history.forEach((roll) => {
        stats[roll.value]++;
    });

    return stats;
}
