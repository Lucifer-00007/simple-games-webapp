// Quiz game logic - pure functions

import { GameState, Question, GameConfig, QUESTIONS, DEFAULT_CONFIG } from './types';

// Shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random questions
export function getRandomQuestions(count: number): Question[] {
    const shuffled = shuffleArray(QUESTIONS);
    return shuffled.slice(0, Math.min(count, QUESTIONS.length));
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    const questions = getRandomQuestions(config.questionsPerGame);
    return {
        questions,
        currentIndex: 0,
        score: 0,
        selectedAnswer: null,
        showResult: false,
        status: 'playing',
        answers: Array(questions.length).fill(null),
    };
}

// Select an answer
export function selectAnswer(state: GameState, answerIndex: number): GameState {
    if (state.status !== 'playing' || state.showResult) return state;

    const currentQuestion = state.questions[state.currentIndex];
    const isCorrect = answerIndex === currentQuestion.correctIndex;
    const newAnswers = [...state.answers];
    newAnswers[state.currentIndex] = answerIndex;

    return {
        ...state,
        selectedAnswer: answerIndex,
        showResult: true,
        score: isCorrect ? state.score + 1 : state.score,
        answers: newAnswers,
    };
}

// Go to next question
export function nextQuestion(state: GameState): GameState {
    if (!state.showResult) return state;

    const nextIndex = state.currentIndex + 1;
    const isFinished = nextIndex >= state.questions.length;

    return {
        ...state,
        currentIndex: isFinished ? state.currentIndex : nextIndex,
        selectedAnswer: null,
        showResult: false,
        status: isFinished ? 'finished' : 'playing',
    };
}

// Check if answer is correct
export function isCorrectAnswer(question: Question, answerIndex: number): boolean {
    return question.correctIndex === answerIndex;
}

// Get progress percentage
export function getProgress(state: GameState): number {
    return ((state.currentIndex + 1) / state.questions.length) * 100;
}

// Reset game
export function resetGame(config: GameConfig = DEFAULT_CONFIG): GameState {
    return createInitialState(config);
}
