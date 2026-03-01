import React from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Habit } from '../types';
import { cn } from '../utils';

interface HabitListProps {
  habits: Habit[];
  completedIds: string[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
}

export const HabitList: React.FC<HabitListProps> = ({ habits, completedIds, onToggle, onDelete, onAdd }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-warm-ink/50 uppercase tracking-widest">Daily Habits</h3>
        {onAdd && (
          <button 
            onClick={onAdd}
            className="p-1.5 hover:bg-warm-cream rounded-full transition-colors text-warm-accent"
          >
            <Plus size={20} />
          </button>
        )}
      </div>
      <div className="grid gap-3">
        {habits.map((habit) => {
          const isCompleted = completedIds.includes(habit.id);
          return (
            <div key={habit.id} className="group relative">
              <button
                onClick={() => onToggle(habit.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-[1.5rem] border transition-all duration-300",
                  isCompleted 
                    ? "bg-warm-ink border-warm-ink text-warm-bg shadow-lg shadow-warm-ink/10" 
                    : "bg-white border-warm-cream hover:border-warm-accent/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <span className="font-medium font-serif text-lg">{habit.name}</span>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted ? "bg-warm-bg text-warm-ink scale-110" : "bg-warm-cream text-transparent"
                )}>
                  <Check size={14} strokeWidth={4} />
                </div>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(habit.id);
                }}
                className="absolute -right-2 -top-2 p-2 bg-rose-50 text-rose-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-rose-100 hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
