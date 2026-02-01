import { useState } from 'react';
import { Calendar, Users, TrendingUp, Plus, Clock, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";

// Assuming Page type matches your App's routing
type Page = 'dashboard' | 'session-planner' | 'team' | 'match'; 

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const attendanceData = [
  { month: 'Jan', attendance: 85 },
  { month: 'Feb', attendance: 88 },
  { month: 'Mar', attendance: 92 },
  { month: 'Apr', attendance: 87 },
  { month: 'May', attendance: 90 },
  { month: 'Jun', attendance: 94 },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState('U-17 Premier Team');
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Dashboard</h1>
          <p className="text-slate-400 font-medium">Welcome back, Coach Martinez</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Team Select using Custom UI Component */}
          <div className="w-56">
            <Select 
              value={selectedTeam} 
              onChange={(val) => setSelectedTeam(val as string)}
              options={[
                { label: 'U-17 Premier Team', value: 'U-17 Premier Team' },
                { label: 'U-19 Development Squad', value: 'U-19 Development Squad' },
                { label: "Women's First Team", value: "Women's First Team" }
              ]} 
            />
          </div>

          <Button 
            onClick={() => onNavigate('session-planner')} 
            icon={<Plus size={16} />}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          >
            Session
          </Button>

          <Button 
            variant="secondary" 
            onClick={() => onNavigate('team')} 
            icon={<Plus size={16} />}
            className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
          >
            Player
          </Button>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Key Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            animate 
            delay={0}
            className="p-6 cursor-pointer hover:border-blue-500/50 transition-colors group"
            onClick={() => onNavigate('session-planner')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700 uppercase tracking-wider">Tomorrow</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Next Session</h3>
            <p className="text-sm text-slate-400 mb-4 line-clamp-1">Defensive Positioning & Counters</p>
            <div className="flex flex-col gap-2 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> 4:00 PM - 6:00 PM
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Field A
              </span>
            </div>
          </Card>

          <Card 
            animate 
            delay={0.1}
            className="p-6 cursor-pointer hover:border-emerald-500/50 transition-colors group"
            onClick={() => onNavigate('match')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700 uppercase tracking-wider">Saturday</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Upcoming Match</h3>
            <p className="text-sm text-slate-400 mb-4">vs. City Rovers FC</p>
            <div className="flex flex-col gap-2 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> 10:00 AM Kickoff
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Away Ground
              </span>
            </div>
          </Card>

          <Card 
            animate 
            delay={0.2}
            className="p-6 cursor-pointer hover:border-purple-500/50 transition-colors group"
            onClick={() => onNavigate('team')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/10 p-3 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider">+3% vs Last Month</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Attendance Rate</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">94%</p>
              <p className="text-xs text-slate-500">Average</p>
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card animate delay={0.3} className="p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-6">Attendance Overview</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255, 0.05)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255, 0.05)'}}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#f8fafc',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar 
                    dataKey="attendance" 
                    fill="url(#colorAttendance)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card animate delay={0.4} className="p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-6">Team Statistics</h3>
            <div className="space-y-8">
              {/* Stat 1 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-400">Training Completion</span>
                  <span className="text-sm font-bold text-white">24 sessions</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                  />
                </div>
              </div>
              
              {/* Stat 2 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-400">Matches Played</span>
                  <span className="text-sm font-bold text-white">8 / 10</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '80%' }}
                     transition={{ duration: 1, delay: 0.7 }}
                     className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  />
                </div>
              </div>
              
              {/* Stat 3 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-400">Squad Availability</span>
                  <span className="text-sm font-bold text-white">22 / 25</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '88%' }}
                     transition={{ duration: 1, delay: 0.9 }}
                     className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]" 
                  />
                </div>
              </div>

              <div className="pt-6 mt-2 border-t border-white/5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-800 transition-colors">
                    <p className="text-2xl font-bold text-emerald-500">6</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wins</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-800 transition-colors">
                    <p className="text-2xl font-bold text-slate-300">1</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Draws</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-800 transition-colors">
                    <p className="text-2xl font-bold text-red-500">1</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Losses</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}