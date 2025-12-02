import React from 'react';
import { Heart, UserCog } from 'lucide-react';

interface FooterProps {
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="w-full bg-violet-100/50 mt-auto border-t border-violet-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Banner: New to Volunteering */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-violet-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-violet-100 p-4 rounded-full shrink-0">
               <Heart className="w-8 h-8 text-violet-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">New to Volunteering?</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                We are so excited to have you join our classroom community. Don't worry if you've never done it before, just come and we will have everything ready for you!
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-slate-400 text-sm pt-4">
          <p>© 2025 Bear Canyon Elementary</p>
          <button 
            onClick={onAdminClick}
            className="flex items-center gap-2 hover:text-violet-500 transition-colors opacity-60 hover:opacity-100"
          >
            <UserCog size={14} />
            <span>Teacher Access</span>
          </button>
        </div>
      </div>
    </footer>
  );
};