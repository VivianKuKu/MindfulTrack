import React from 'react';
import { Smile, Meh, Frown, Heart, CloudRain } from 'lucide-react';
import { Mood } from '../types';
import { cn } from '../utils';

interface MoodSelectorProps {
  selected: Mood | null;
  onSelect: (mood: Mood) => void;
}

const moods: { type: Mood; icon: React.ElementType; label: string; color: string }[] = [
  { type: 'great', icon: Heart, label: 'Great', color: 'text-mood-great bg-mood-great/10' },
  { type: 'good', icon: Smile, label: 'Good', color: 'text-mood-good bg-mood-good/10' },
  { type: 'neutral', icon: Meh, label: 'Neutral', color: 'text-mood-neutral bg-mood-neutral/10' },
  { type: 'bad', icon: Frown, label: 'Bad', color: 'text-mood-bad bg-mood-bad/10' },
  { type: 'terrible', icon: CloudRain, label: 'Terrible', color: 'text-mood-terrible bg-mood-terrible/10' },
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
