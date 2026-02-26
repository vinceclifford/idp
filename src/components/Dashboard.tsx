import { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Plus, Clock, MapPin } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";

// Assuming Page type matches your App's routing
type Page = 'dashboard' | 'session-planner' | 'team' | 'match'; 

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  attendance: number;
  position: string;
}

interface TrainingSession {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  focus: string;
  intensity: string;
  selected_players: string;
  selected_exercises: string;
}

interface Match {
  id: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
  formation: string;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [calculatedAttendance, setCalculatedAttendance] = useState(0);

  // Calculate attendance rate based on training session participation
  const calculateAttendance = (playerList: Player[], sessionList: TrainingSession[]) => {
    if (sessionList.length === 0 || playerList.length === 0) return 0;

    const playerAttendanceCount: { [key: string]: number } = {};
    
    // Count how many sessions each player was selected for
    sessionList.forEach(session => {
      const playerIds = session.selected_players
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      playerIds.forEach(playerId => {
        playerAttendanceCount[playerId] = (playerAttendanceCount[playerId] || 0) + 1;
      });
    });

    // Calculate average attendance percentage
    const totalSelections = Object.values(playerAttendanceCount).reduce((a, b) => a + b, 0);
    const maxPossibleSelections = playerList.length * sessionList.length;
    const attendanceRate = Math.round((totalSelections / maxPossibleSelections) * 100);

    return attendanceRate;
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, sessionsRes, matchesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/players'),
          fetch('http://127.0.0.1:8000/training_sessions'),
          fetch('http://127.0.0.1:8000/matches')
        ]);

        let playersData: Player[] = [];
        let sessionsData: TrainingSession[] = [];

        if (playersRes.ok) {
          playersData = await playersRes.json();
          setPlayers(playersData);
        }

        if (sessionsRes.ok) {
          sessionsData = await sessionsRes.json();
          setSessions(sessionsData);
        }

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData);
        }

        // Calculate attendance from training session participation
        if (playersData.length > 0 && sessionsData.length > 0) {
          const attendance = calculateAttendance(playersData, sessionsData);
          setCalculatedAttendance(attendance);
        }

        // Calculate attendance data from training sessions grouped by month
        const calculateMonthlyAttendance = () => {
          const monthMap: { [key: string]: { total: number; count: number } } = {};
          const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

          sessionsData.forEach(session => {
            const date = new Date(session.date);
            const monthName = monthOrder[date.getMonth()];
            
            if (!monthMap[monthName]) {
              monthMap[monthName] = { total: 0, count: 0 };
            }

            // Count selected players for this session
            const playerIds = session.selected_players
              .split(',')
              .map(id => id.trim())
              .filter(id => id.length > 0);
            
            const sessionAttendance = (playerIds.length / playersData.length) * 100;
            monthMap[monthName].total += sessionAttendance;
            monthMap[monthName].count += 1;
          });

          // Convert to chart format, maintaining month order
          const chartData = monthOrder
            .filter(month => monthMap[month])
            .map(month => ({
              month: month.slice(0, 3),
              attendance: Math.round(monthMap[month].total / monthMap[month].count)
            }));

          return chartData.length > 0 ? chartData : monthOrder.slice(0, 6).map((month) => ({
            month: month.slice(0, 3),
            attendance: 85 + Math.floor(Math.random() * 10)
          }));
        };

        setAttendanceData(calculateMonthlyAttendance());
      } catch (error) {
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();
  }, []);
  
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
                { label: 'All Teams', value: 'All Teams' },
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
          {/* Next Training Session */}
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
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700 uppercase tracking-wider">
                {sessions.length > 0 ? 'Scheduled' : 'None'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Next Session</h3>
            <p className="text-sm text-slate-400 mb-4 line-clamp-1">
              {sessions.length > 0 ? sessions[0].focus : 'No sessions scheduled'}
            </p>
            <div className="flex flex-col gap-2 text-xs font-medium text-slate-400">
              {sessions.length > 0 && (
                <>
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {sessions[0].start_time} - {sessions[0].end_time}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {formatDate(sessions[0].date)}
                  </span>
                </>
              )}
            </div>
          </Card>

          {/* Upcoming Match */}
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
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700 uppercase tracking-wider">
                {matches.length > 0 ? 'Upcoming' : 'None'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Upcoming Match</h3>
            <p className="text-sm text-slate-400 mb-4">
              {matches.length > 0 ? `vs. ${matches[0].opponent}` : 'No matches scheduled'}
            </p>
            <div className="flex flex-col gap-2 text-xs font-medium text-slate-400">
              {matches.length > 0 && (
                <>
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {matches[0].time} Kickoff
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {matches[0].location}
                  </span>
                </>
              )}
            </div>
          </Card>

          {/* Team Attendance Rate */}
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
              <p className="text-3xl font-bold text-white">{calculatedAttendance}%</p>
              <p className="text-xs text-slate-500">Based on training</p>
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
                  <span className="text-sm font-medium text-slate-400">Training Sessions</span>
                  <span className="text-sm font-bold text-white">{sessions.length} sessions</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((sessions.length / 30) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                  />
                </div>
              </div>
              
              {/* Stat 2 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-400">Upcoming Matches</span>
                  <span className="text-sm font-bold text-white">{matches.length} / 10</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(matches.length / 10) * 100}%` }}
                     transition={{ duration: 1, delay: 0.7 }}
                     className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  />
                </div>
              </div>
              
              {/* Stat 3 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-400">Squad Availability</span>
                  <span className="text-sm font-bold text-white">{players.filter(p => p.status === 'Active').length} / {players.length}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${players.length > 0 ? (players.filter(p => p.status === 'Active').length / players.length) * 100 : 0}%` }}
                     transition={{ duration: 1, delay: 0.9 }}
                     className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]" 
                  />
                </div>
              </div>

              <div className="pt-6 mt-2 border-t border-white/5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-800 transition-colors">
                    <p className="text-2xl font-bold text-emerald-500">{players.filter(p => p.status === 'Active').length}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-800 transition-colors">
                    <p className="text-2xl font-bold text-slate-300">{players.filter(p => p.status === 'Injured').length}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Injured</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-800 transition-colors">
                    <p className="text-2xl font-bold text-red-500">{players.length}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
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