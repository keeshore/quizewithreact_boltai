import { Class, Question, Participant, Answer } from '../types/quiz';

// Storage keys
const STORAGE_KEYS = {
  CLASSES: 'quiz_classes',
  QUESTIONS: 'quiz_questions',
  PARTICIPANTS: 'quiz_participants',
  ANSWERS: 'quiz_answers',
};

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

// Class operations
export const saveClass = (newClass: Class): void => {
  const classes = getFromStorage<Class>(STORAGE_KEYS.CLASSES);
  classes.push(newClass);
  saveToStorage(STORAGE_KEYS.CLASSES, classes);
};

export const getClassByCode = (classCode: string): Class | null => {
  const classes = getFromStorage<Class>(STORAGE_KEYS.CLASSES);
  return classes.find(c => c.classCode === classCode) || null;
};

export const getClassById = (classId: string): Class | null => {
  const classes = getFromStorage<Class>(STORAGE_KEYS.CLASSES);
  return classes.find(c => c.id === classId) || null;
};

export const getClassesByCreatorId = (creatorId: string): Class[] => {
  const classes = getFromStorage<Class>(STORAGE_KEYS.CLASSES);
  return classes.filter(c => c.creatorId === creatorId);
};

// Question operations
export const saveQuestion = (question: Question): void => {
  const questions = getFromStorage<Question>(STORAGE_KEYS.QUESTIONS);
  questions.push(question);
  saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
};

export const getQuestionsByClassId = (classId: string): Question[] => {
  const questions = getFromStorage<Question>(STORAGE_KEYS.QUESTIONS);
  return questions.filter(q => q.classId === classId).sort((a, b) => a.orderIndex - b.orderIndex);
};

export const getQuestionById = (questionId: string): Question | null => {
  const questions = getFromStorage<Question>(STORAGE_KEYS.QUESTIONS);
  return questions.find(q => q.id === questionId) || null;
};

// Participant operations
export const saveParticipant = (participant: Participant): void => {
  const participants = getFromStorage<Participant>(STORAGE_KEYS.PARTICIPANTS);
  participants.push(participant);
  saveToStorage(STORAGE_KEYS.PARTICIPANTS, participants);
};

export const updateParticipant = (updatedParticipant: Participant): void => {
  const participants = getFromStorage<Participant>(STORAGE_KEYS.PARTICIPANTS);
  const index = participants.findIndex(p => p.id === updatedParticipant.id);
  if (index !== -1) {
    participants[index] = updatedParticipant;
    saveToStorage(STORAGE_KEYS.PARTICIPANTS, participants);
  }
};

export const getParticipantsByClassId = (classId: string): Participant[] => {
  const participants = getFromStorage<Participant>(STORAGE_KEYS.PARTICIPANTS);
  return participants.filter(p => p.classId === classId);
};

export const getParticipantByToken = (token: string): Participant | null => {
  const participants = getFromStorage<Participant>(STORAGE_KEYS.PARTICIPANTS);
  return participants.find(p => p.token === token) || null;
};

export const getParticipantsByUserId = (userId: string): Participant[] => {
  const participants = getFromStorage<Participant>(STORAGE_KEYS.PARTICIPANTS);
  return participants.filter(p => p.userId === userId);
};

// Answer operations
export const saveAnswer = (answer: Answer): void => {
  const answers = getFromStorage<Answer>(STORAGE_KEYS.ANSWERS);
  answers.push(answer);
  saveToStorage(STORAGE_KEYS.ANSWERS, answers);
};

export const getAnswersByParticipantId = (participantId: string): Answer[] => {
  const answers = getFromStorage<Answer>(STORAGE_KEYS.ANSWERS);
  return answers.filter(a => a.participantId === participantId);
};

export const getAnswersByClassId = (classId: string): Answer[] => {
  const answers = getFromStorage<Answer>(STORAGE_KEYS.ANSWERS);
  const participants = getParticipantsByClassId(classId);
  const participantIds = participants.map(p => p.id);
  return answers.filter(a => participantIds.includes(a.participantId));
};