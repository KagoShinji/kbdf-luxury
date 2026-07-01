import type { ReactNode } from "react";
import { cn } from "../../lib/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  onClick?: () => void;
}

export function Card({ children, className, innerClassName, onClick }: CardProps) {
  // Double-Bezel architecture from high-end-visual-design skill
  return (
    <div 
      className={cn(
        "group relative bg-typography-primary/5 p-1.5 rounded-[2rem] ring-1 ring-black/5 dark:ring-white/10 transition-all duration-700 ease-fluid",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <div className={cn(
        "relative h-full w-full bg-surface-white rounded-[calc(2rem-0.375rem)] shadow-inner-glass overflow-hidden",
        innerClassName
      )}>
        {children}
      </div>
    </div>
  );
}
