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
  const [isManageMode, setIsManageMode] = React.useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-warm-ink/50 uppercase tracking-widest">Daily Habits</h3>
          <button 
            onClick={() => {
              if (window.navigator.vibrate) window.navigator.vibrate(20);
              setIsManageMode(!isManageMode);
            }}
            className={cn(
              "text-[10px] font-bold px-3 py-1.5 rounded-full transition-all uppercase tracking-wider border",
              isManageMode 
                ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" 
                : "bg-white text-warm-ink/60 border-warm-cream hover:border-warm-accent/30"
            )}
          >
            {isManageMode ? 'Done' : 'Manage'}
          </button>
        </div>
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
                onClick={() => isManageMode ? onDelete(habit.id) : onToggle(habit.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-[1.5rem] border transition-all duration-300",
                  isManageMode 
                    ? "border-rose-200 bg-rose-50/30" 
                    : isCompleted 
                      ? "bg-warm-ink border-warm-ink text-warm-bg shadow-lg shadow-warm-ink/10" 
                      : "bg-white border-warm-cream hover:border-warm-accent/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <span className={cn(
                    "font-medium font-serif text-lg",
                    isManageMode && "text-rose-900"
                  )}>{habit.name}</span>
                </div>
                
                {isManageMode ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-600 animate-pulse">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Delete</span>
                    <Trash2 size={14} />
                  </div>
                ) : (
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted ? "bg-warm-bg text-warm-ink scale-110" : "bg-warm-cream text-transparent"
                  )}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
