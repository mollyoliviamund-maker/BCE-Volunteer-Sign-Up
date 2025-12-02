import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SelectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  colorClass?: string;
  iconColorClass?: string;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  colorClass = "bg-white hover:border-violet-200",
  iconColorClass = "text-violet-500 bg-violet-50"
}) => {
  return (
    <button 
      onClick={onClick}
      className={`group w-full text-left p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300 ${colorClass} flex flex-col md:flex-row items-start md:items-center gap-6`}
    >
      <div className={`p-4 rounded-xl shrink-0 transition-transform group-hover:scale-110 duration-300 ${iconColorClass}`}>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-700 mb-2 group-hover:text-violet-600 transition-colors">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{description}</p>
      </div>
      <div className="hidden md:block ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-violet-300">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};