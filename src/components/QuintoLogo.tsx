'use client';

import React from 'react';

export const QuintoLogo: React.FC<{ className?: string }> = ({ className = 'h-10' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 5-Gear Icon Mark */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="quintoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          {/* Gear teeth */}
          <path
            d="M50 15 L54 22 L62 20 L64 28 L72 29 L71 37 L78 41 L74 48 L80 54 L74 58 L77 66 L69 68 L69 76 L61 76 L58 84 L50 82 L42 84 L39 76 L31 76 L31 68 L23 66 L26 58 L20 54 L26 48 L22 41 L29 37 L28 29 L36 28 L38 20 L46 22 Z"
            fill="none"
            stroke="url(#quintoGrad)"
            strokeWidth="5"
            strokeLinejoin="round"
            className="opacity-80"
          />
          {/* Central 5 Number Shape */}
          <path
            d="M32 30 H64 V44 H34 V70 H64"
            fill="none"
            stroke="url(#quintoGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold text-base tracking-wider text-white">QUINTO EJE</span>
        </div>
        <span className="font-bold text-[10px] tracking-[0.25em] text-cyan-400 uppercase mt-0.5">
          INGENIERÍA
        </span>
        <span className="text-[7.5px] tracking-tight text-slate-400 font-medium">
          IA, DATOS Y SOLUCIONES INTELIGENTES
        </span>
      </div>
    </div>
  );
};
