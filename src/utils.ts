import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, subDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateStreak(habitId: string, logs: Record<string, { habits: string[] }>): number {
  let streak = 0;
  let date = new Date();
  let dateKey = format(date, 'yyyy-MM-dd');

  // If not done today, check if it was done yesterday. 
  // If yesterday was also not done, streak is 0.
  if (!logs[dateKey]?.habits.includes(habitId)) {
    date = subDays(date, 1);
    dateKey = format(date, 'yyyy-MM-dd');
    if (!logs[dateKey]?.habits.includes(habitId)) {
      return 0;
    }
  }

  // Count backwards
  while (logs[dateKey]?.habits.includes(habitId)) {
    streak++;
    date = subDays(date, 1);
    dateKey = format(date, 'yyyy-MM-dd');
  }

  return streak;
}
