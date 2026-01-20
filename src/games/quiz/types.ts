// Quiz game types

export type GameStatus = 'playing' | 'finished';

export interface Question {
    question: string;
    options: string[];
    correctIndex: number;
    category?: string;
}

export interface GameState {
    questions: Question[];
    currentIndex: number;
    score: number;
    selectedAnswer: number | null;
    showResult: boolean;
    status: GameStatus;
    answers: (number | null)[];
}

export interface GameConfig {
    questionsPerGame: number;
    timePerQuestion?: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    questionsPerGame: 10,
};

// Question bank
export const QUESTIONS: Question[] = [
    {
        question: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Markup Language'],
        correctIndex: 0,
        category: 'Web Development',
    },
    {
        question: 'Which programming language is known as the "language of the web"?',
        options: ['Python', 'Java', 'JavaScript', 'C++'],
        correctIndex: 2,
        category: 'Programming',
    },
    {
        question: 'What does CSS stand for?',
        options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'],
        correctIndex: 1,
        category: 'Web Development',
    },
    {
        question: 'Which symbol is used for single-line comments in JavaScript?',
        options: ['#', '//', '/*', '--'],
        correctIndex: 1,
        category: 'JavaScript',
    },
    {
        question: 'What is the output of typeof null in JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correctIndex: 2,
        category: 'JavaScript',
    },
    {
        question: 'Which company developed React?',
        options: ['Google', 'Microsoft', 'Facebook/Meta', 'Apple'],
        correctIndex: 2,
        category: 'Frameworks',
    },
    {
        question: 'What is the correct way to declare a variable in modern JavaScript?',
        options: ['var x = 5', 'let x = 5', 'const x = 5', 'Both let and const'],
        correctIndex: 3,
        category: 'JavaScript',
    },
    {
        question: 'Which HTTP method is typically used to retrieve data?',
        options: ['POST', 'PUT', 'GET', 'DELETE'],
        correctIndex: 2,
        category: 'Web Development',
    },
    {
        question: 'What does API stand for?',
        options: ['Application Programming Interface', 'Advanced Programming Integration', 'Application Process Integration', 'Automated Programming Interface'],
        correctIndex: 0,
        category: 'General',
    },
    {
        question: 'Which data structure follows LIFO (Last In First Out)?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correctIndex: 1,
        category: 'Data Structures',
    },
    {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
        correctIndex: 2,
        category: 'Algorithms',
    },
    {
        question: 'Which hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useMemo'],
        correctIndex: 1,
        category: 'React',
    },
];
