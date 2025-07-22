// Type declarations for ElderMate Dashboard

export interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface StatusItem {
  label: string;
  value: string;
  icon: string;
}

export interface Reminder {
  task: string;
  time: string;
  completed: boolean;
}

export interface FamilyMessage {
  sender: string;
  message: string;
  relationship: string;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  transcription: string;
  status: string;
}

export interface GameContent {
  trivia: string;
  memory: string;
  math: string;
}

export interface EntertainmentContent {
  music: string;
  story: string;
  joke: string;
  news: string;
}

export type ModalType = 'reminders' | 'entertainment' | 'games' | 'family' | null;

export type GameType = 'trivia' | 'memory' | 'math';

export type EntertainmentType = 'music' | 'story' | 'joke' | 'news';

// Extend the Window interface to include Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: SpeechGrammarList;
  
  start(): void;
  stop(): void;
  abort(): void;
  
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechGrammarList {
  length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

export interface SpeechGrammar {
  src: string;
  weight: number;
}
