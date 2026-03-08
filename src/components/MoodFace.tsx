import React from 'react';

interface MoodFaceProps {
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  size?: number;
  className?: string;
}

export const MoodFace: React.FC<MoodFaceProps> = ({ mood, size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circular face background */}
      <circle cx="12" cy="12" r="12" fill="currentColor" />

      {/* Eyes */}
      <circle cx="8" cy="10.5" r="1.5" fill="#1C1C1E" />
      <circle cx="16" cy="10.5" r="1.5" fill="#1C1C1E" />

      {/* Mouth based on mood */}
      {mood === 'great' && (
        <path d="M 8 13.5 C 8 18, 16 18, 16 13.5 Z" fill="#1C1C1E" />
      )}

      {mood === 'good' && (
        <path d="M 8 14 Q 12 17.5 16 14" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {mood === 'neutral' && (
        <line x1="9" y1="15" x2="15" y2="15" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {mood === 'bad' && (
        <path d="M 8 16 Q 12 12.5 16 16" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {mood === 'terrible' && (
        <g>
          {/* Frown mouth */}
          <path d="M 8 16.5 C 8 12.5, 16 12.5, 16 16.5 Z" fill="#1C1C1E" />
          {/* Teardrop slightly over right eye */}
          <path d="M 17 8 C 17 8, 19 10.5, 18.5 11.5 C 18 12.5, 16.5 12, 16.5 11 C 16.5 10, 17 8, 17 8 Z" fill="#E2E8F0" />
        </g>
      )}
    </svg>
  );
};
