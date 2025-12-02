import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-violet-400 hover:bg-violet-500 text-white shadow-lg shadow-violet-200 focus:ring-violet-300",
    secondary: "bg-teal-400 hover:bg-teal-500 text-white shadow-lg shadow-teal-200 focus:ring-teal-300",
    outline: "border-2 border-violet-200 text-violet-500 hover:bg-violet-50 focus:ring-violet-300",
    ghost: "text-slate-400 hover:text-violet-500 hover:bg-violet-50"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};