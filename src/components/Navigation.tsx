import { Home, Users, Calendar, BookOpen, Lightbulb, Trophy, Target, LogOut, Clipboard } from 'lucide-react';
import { Page } from '../App';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function Navigation({ currentPage, onNavigate, onLogout }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: Home },
    { id: 'team' as Page, label: 'Team', icon: Users },
    { id: 'session-planner' as Page, label: 'Training', icon: Calendar },
    { id: 'training' as Page, label: 'Exercises', icon: Clipboard },
    { id: 'basics' as Page, label: 'Basics', icon: BookOpen },
    { id: 'principles' as Page, label: 'Principles', icon: Lightbulb },
    { id: 'tactics' as Page, label: 'Tactics', icon: Trophy },
    { id: 'match' as Page, label: 'Match & Lineup', icon: Target },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20">
      <div className="max-w-[1600px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden md:block">CoachHub</span>
          </div>
          
          {/* Nav Items */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white' // Active Text
                      : 'text-slate-400 hover:text-white hover:bg-white/5' // Inactive Text
                  }`}
                >
                  {/* Active Indicator Background */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 border border-white/5 rounded-lg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon & Label */}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Logout Section */}
          <div className="flex items-center pl-4 border-l border-white/5">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}