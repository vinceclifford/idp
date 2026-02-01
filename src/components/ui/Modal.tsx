import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, icon, children, footer, maxWidth = "max-w-2xl" }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with strong blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content - THE GLASS EFFECT IS HERE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${maxWidth} bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}
            style={{ boxShadow: '0 0 50px -12px rgba(0, 0, 0, 0.5)' }} // Deep shadow
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                {icon && <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">{icon}</div>}
                {title}
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body - Added custom scrollbar styling via class */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}