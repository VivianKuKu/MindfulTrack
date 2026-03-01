export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface DayLog {
  date: string; // ISO string (YYYY-MM-DD)
  mood: Mood | null;
  habits: string[]; // IDs of completed habits
  note: string;
}

export interface AppState {
  habits: Habit[];
  logs: Record<string, DayLog>;
}
