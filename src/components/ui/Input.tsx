import { forwardRef, useState } from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

import { InputProps } from "../../types/ui";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, label, error, rightElement, type, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <motion.div
          className="relative group"
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none transition-all",
              "placeholder:text-slate-600",
              "focus:bg-slate-900 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10",
              "hover:border-white/10",
              type === 'number' && "no-spinner", 
              icon && "pl-10",
              rightElement && "pr-12",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            {...props}
          />
          
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-medium bg-white/5 px-2 py-1 rounded-md border border-white/5 pointer-events-none">
              {rightElement}
            </div>
          )}
        </motion.div>
        {error && <p className="text-xs text-red-400 font-medium ml-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";