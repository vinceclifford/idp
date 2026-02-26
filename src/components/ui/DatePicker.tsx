import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get first day of month and number of days
  const firstDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
  const lastDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create grid of days
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDateClick = (day: number) => {
    const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1));
  };

  const monthYear = displayMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  // Display as DD/MM/YYYY — string-sliced from the stored YYYY-MM-DD value to avoid timezone drift
  const displayValue = value && value.length >= 10
    ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`
    : 'DD/MM/YYYY';

  return (
    <div className="relative space-y-2" ref={containerRef}>
      {label && <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 bg-slate-900/50 border text-sm text-left rounded-xl flex items-center justify-between transition-all
          ${isOpen 
            ? 'border-blue-500/50 bg-slate-900 ring-4 ring-blue-500/10' 
            : 'border-white/5 hover:border-white/10'
          }`}
      >
        <span className={selectedDate ? 'text-white' : 'text-slate-600'}>{displayValue}</span>
        <Calendar size={16} className={`transition-colors ${isOpen ? 'text-blue-400' : 'text-slate-500'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-4 w-80"
          >
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={18} className="text-slate-400" />
              </button>
              <span className="text-sm font-bold text-white">{monthYear}</span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} />;
                }

                const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
                date.setHours(0, 0, 0, 0);
                
                const isSelected = selectedDate && selectedDate.getTime() === date.getTime();
                const isToday = date.getTime() === today.getTime();

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square rounded-lg text-sm font-bold transition-all
                      ${isSelected
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400'
                        : isToday
                        ? 'bg-slate-800 text-white border border-blue-500/50'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-white/5'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
