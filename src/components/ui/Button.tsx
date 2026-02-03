import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, fullWidth, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed will-change-transform";
    
    const variants = {
      primary: "bg-cafe-charcoal text-cafe-50 hover:bg-cafe-slate hover:-translate-y-0.5 shadow-sm hover:shadow-lg",
      secondary: "bg-cafe-100 text-cafe-charcoal hover:bg-cafe-200",
      outline: "border-2 border-cafe-slate bg-transparent text-cafe-charcoal hover:border-amber-600 hover:text-amber-600 hover:-translate-y-0.5",
      ghost: "border-2 border-cafe-slate bg-transparent text-cafe-slate hover:bg-cafe-100 hover:text-cafe-charcoal hover:-translate-y-0.5",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
