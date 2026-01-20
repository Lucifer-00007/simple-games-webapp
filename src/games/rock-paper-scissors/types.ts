// Rock Paper Scissors game types

export type Choice = 'rock' | 'paper' | 'scissors';
export type Result = 'win' | 'lose' | 'tie';

export interface RoundResult {
    playerChoice: Choice;
    computerChoice: Choice;
    result: Result;
    message: string;
}

export interface GameState {
    playerScore: number;
    computerScore: number;
    rounds: RoundResult[];
    lastRound: RoundResult | null;
}
