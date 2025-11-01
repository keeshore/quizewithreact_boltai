export interface Class {
  id: string;
  classCode: string;
  name: string;
  description: string;
  passwordHash: string;
  maxMembers: number;
  createdAt: string;
  creatorId: string;
}

export interface Question {
  id: string;
  classId: string;
  text: string;
  options: string[];
  correctIndex: number;
  orderIndex: number;
  imagePath?: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  classId: string;
  name: string;
  userId?: string; // Link to registered user
  joinedAt: string;
  finishedAt?: string;
  score?: number;
  questionSequence: string[]; // shuffled question IDs
  totalTimeMs?: number;
  token: string;
}

export interface Answer {
  id: string;
  participantId: string;
  questionId: string;
  selectedIndex?: number;
  isCorrect: boolean;
  answeredAt: string;
  timeTakenMs: number;
}

export interface ClassSummary {
  class: Class;
  participants: Participant[];
  questions: Question[];
  answers: Answer[];
}