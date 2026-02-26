import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(value ? new Date(value) : new Date());

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const monthYear = displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const displayValue = selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date';

  return (
    <div className="relative">
      {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-slate-200 hover:border-white/20 transition-colors text-left flex items-center justify-between"
      >
        <span>{displayValue}</span>
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50 p-4 w-80">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-400" />
            </button>
            <span className="text-sm font-bold text-white">{monthYear}</span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
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
                    aspect-square rounded text-sm font-bold transition-all
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

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm font-semibold transition-colors border border-white/5"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
