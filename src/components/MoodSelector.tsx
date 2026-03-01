import React from 'react';
import { Smile, Meh, Frown, Heart, CloudRain } from 'lucide-react';
import { Mood } from '../types';
import { cn } from '../utils';

interface MoodSelectorProps {
  selected: Mood | null;
  onSelect: (mood: Mood) => void;
}

const moods: { type: Mood; icon: React.ElementType; label: string; color: string }[] = [
  { type: 'great', icon: Heart, label: 'Great', color: 'text-warm-rose bg-warm-rose/10' },
  { type: 'good', icon: Smile, label: 'Good', color: 'text-warm-sage bg-warm-sage/10' },
  { type: 'neutral', icon: Meh, label: 'Neutral', color: 'text-warm-accent bg-warm-accent/10' },
  { type: 'bad', icon: Frown, label: 'Bad', color: 'text-warm-ink/60 bg-warm-ink/5' },
  { type: 'terrible', icon: CloudRain, label: 'Terrible', color: 'text-zinc-400 bg-zinc-100' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex justify-between items-center gap-2">
      {moods.map(({ type, icon: Icon, label, color }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 flex-1",
            selected === type 
              ? cn(color, "ring-2 ring-offset-2 ring-current scale-105 shadow-sm")
              : "bg-white/50 hover:bg-white text-warm-ink/40"
          )}
        >
          <Icon size={28} strokeWidth={selected === type ? 2.5 : 1.5} />
          <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
        </button>
      ))}
    </div>
  );
};
