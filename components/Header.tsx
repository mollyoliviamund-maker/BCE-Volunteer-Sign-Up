import React from 'react';
import { BookOpen, School } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 md:h-20 md:w-20 flex items-center justify-center shrink-0 text-violet-500 bg-violet-50 rounded-2xl p-3 border border-violet-100">
             <School className="w-full h-full" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-700 tracking-tight">
              Bear Canyon Preschool Volunteers
            </h1>
            <p className="text-sm text-indigo-400 font-medium">Classroom Support Sign Up</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
          <BookOpen size={16} />
          <span>2025-2026 School Year</span>
        </div>
      </div>
    </header>
  );
};