import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, icon, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0",
      secondary: "bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
      ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white border-0",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";