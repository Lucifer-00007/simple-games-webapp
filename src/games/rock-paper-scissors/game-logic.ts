import { Choice, Result, RoundResult, GameState } from './types';

// Get random computer choice
export function getComputerChoice(): Choice {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

// Determine winner
export function determineWinner(playerChoice: Choice, computerChoice: Choice): Result {
    if (playerChoice === computerChoice) {
        return 'tie';
    }

    const winConditions: Record<Choice, Choice> = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper',
    };

    return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
}

// Get result message
export function getResultMessage(result: Result, playerChoice: Choice, computerChoice: Choice): string {
    switch (result) {
        case 'tie':
            return "It's a tie!";
        case 'win':
            return `You win! ${capitalize(playerChoice)} beats ${capitalize(computerChoice)}`;
        case 'lose':
            return `You lose! ${capitalize(computerChoice)} beats ${capitalize(playerChoice)}`;
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Play a round
export function playRound(playerChoice: Choice): RoundResult {
    const computerChoice = getComputerChoice();
    const result = determineWinner(playerChoice, computerChoice);
    const message = getResultMessage(result, playerChoice, computerChoice);

    return {
        playerChoice,
        computerChoice,
        result,
        message,
    };
}

// Create initial state
export function createInitialState(): GameState {
    return {
        playerScore: 0,
        computerScore: 0,
        rounds: [],
        lastRound: null,
    };
}

// Update state after a round
export function updateState(state: GameState, roundResult: RoundResult): GameState {
    return {
        playerScore: state.playerScore + (roundResult.result === 'win' ? 1 : 0),
        computerScore: state.computerScore + (roundResult.result === 'lose' ? 1 : 0),
        rounds: [...state.rounds, roundResult],
        lastRound: roundResult,
    };
}
