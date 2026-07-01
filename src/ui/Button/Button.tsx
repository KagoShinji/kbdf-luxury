import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils/cn";
import { ArrowUpRight } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: ReactNode;
  withTrailingArrow?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  className, 
  icon,
  withTrailingArrow,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "group relative inline-flex items-center justify-center font-sans font-medium tracking-wide transition-all duration-700 ease-fluid active:scale-[0.98]";
  
  const variants = {
    primary: "bg-typography-primary text-white rounded-full px-6 py-3 hover:bg-[#2a4360]",
    secondary: "bg-brand-peach text-typography-primary rounded-full px-6 py-3 hover:bg-brand-rose hover:text-white",
    outline: "border border-typography-primary/20 text-typography-primary rounded-full px-6 py-3 hover:border-typography-primary/50"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
      
      {/* Button-in-Button Trailing Icon Architecture */}
      {withTrailingArrow && (
        <span className="ml-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <ArrowUpRight className="w-4 h-4 text-current group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-transform duration-500 ease-fluid" />
        </span>
      )}
    </button>
  );
}
