import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

import { CardProps } from "../../types/ui";

export function Card({ className, children, animate = false, delay = 0, ...props }: CardProps) {
  const baseClass = "bg-surface backdrop-blur-xl border border-border rounded-xl shadow-lg relative overflow-hidden";
  
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={cn(baseClass, className)}
        {...props as any}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(baseClass, className)} {...props}>
      {children}
    </div>
  );
}