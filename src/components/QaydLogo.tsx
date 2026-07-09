/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface QaydLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: 'dark' | 'light';
  animated?: boolean;
}

export default function QaydLogo({
  className = '',
  size = 48,
  showText = true,
  textColor = 'dark',
  animated = false
}: QaydLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div 
        className={`relative ${animated ? 'animate-pulse' : ''}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Hexagon & Q tail gradient */}
            <linearGradient id="qayd-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#115e59" /> {/* Deep teal */}
              <stop offset="50%" stopColor="#0d9488" /> {/* Teal */}
              <stop offset="100%" stopColor="#10b981" /> {/* Emerald green */}
            </linearGradient>
            
            {/* Ambient drop shadow for the logo */}
            <filter id="qayd-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0d9488" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Hexagon Path with rounded corners */}
          <path
            d="M100 15 L170 55 L170 145 L100 185 L30 145 L30 55 Z"
            stroke="url(#qayd-grad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#qayd-shadow)"
          />

          {/* Outer circle of the letter Q */}
          <circle
            cx="100"
            cy="95"
            r="42"
            stroke="url(#qayd-grad)"
            strokeWidth="16"
          />

          {/* Styled tail / dash of the Q */}
          <path
            d="M96 98 L142 144 C148 150, 154 146, 158 140 C162 134, 152 126, 142 120 L115 105"
            stroke="url(#qayd-grad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col items-center">
          <span 
            className={`font-mono tracking-[0.45em] text-center uppercase font-black mr-[0.45em] ${
              textColor === 'light' ? 'text-white' : 'text-slate-800'
            }`}
            style={{ fontSize: Math.max(10, size * 0.28) }}
          >
            QAYD
          </span>
          <span 
            className={`font-sans tracking-wide text-center font-extrabold -mt-1 ${
              textColor === 'light' ? 'text-indigo-200' : 'text-indigo-600'
            }`}
            style={{ fontSize: Math.max(9, size * 0.22) }}
          >
            قَـيْـد
          </span>
        </div>
      )}
    </div>
  );
}
