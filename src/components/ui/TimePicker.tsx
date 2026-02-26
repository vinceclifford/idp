import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimePickerProps {
  value: string;       // "HH:MM" 24-hour format
  onChange: (time: string) => void;
  label?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);  // 0 – 23
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parts = value ? value.split(':') : ['9', '0'];
  const h24 = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emit = (hour: number, min: number) =>
    onChange(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);

  return (
    <div className="relative space-y-2" ref={containerRef}>
      {label && (
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 bg-slate-900/50 border text-sm text-left rounded-xl flex items-center justify-between transition-all
          ${isOpen
            ? 'border-blue-500/50 bg-slate-900 ring-4 ring-blue-500/10'
            : 'border-white/5 hover:border-white/10'
          }`}
      >
        <span className={value ? 'text-white font-mono' : 'text-slate-600'}>
          {value || 'HH:MM'}
        </span>
        <Clock size={16} className={`transition-colors ${isOpen ? 'text-blue-400' : 'text-slate-500'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-4 w-72"
          >
            <div className="flex gap-3">
              {/* Hours 00–23 */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-2">Hour</p>
                <div className="grid grid-cols-4 gap-1 max-h-52 overflow-y-auto custom-scrollbar">
                  {HOURS.map(h => (
                    <button
                      key={h}
                      onClick={() => emit(h, minute)}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${
                        h24 === h
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-white/5'
                      }`}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px bg-white/5 self-stretch" />

              {/* Minutes */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-2">Min</p>
                <div className="grid grid-cols-3 gap-1 max-h-52 overflow-y-auto custom-scrollbar">
                  {MINUTES.map(m => (
                    <button
                      key={m}
                      onClick={() => emit(h24, m)}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${
                        minute === m
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-white/5'
                      }`}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
