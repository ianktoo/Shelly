
export interface TeacherReport {
  id: string;
  timestamp: number;
  childMessage: string;
  severity: 'high' | 'medium';
  studentName?: string;
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  lastMood: 'happy' | 'sad' | 'angry' | 'calm' | 'anxious';
  interactionCount: number;
}

export interface ClassDocument {
  name: string;
  type: string;
  size: string;
  content: string;
}

export interface ConversationSummary {
  id: string;
  timestamp: number;
  studentName: string;
  topic: string;
  duration: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface VoiceSessionState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  lastTranscript: string;
}

export enum AppRoute {
  HOME = 'home',
  TEACHER = 'teacher'
}

export enum DashboardView {
  OVERVIEW = 'overview',
  STUDENTS = 'students',
  SAFETY = 'safety',
  CLASS_DATA = 'class_data',
  CALENDAR = 'calendar'
}
