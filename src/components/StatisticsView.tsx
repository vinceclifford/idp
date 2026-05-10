import { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Target, BarChart2, 
  Activity, Users, ArrowUpRight, 
  ArrowDownRight, Award, Zap, History
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area 
} from 'recharts';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { useTeam } from '../contexts/TeamContext';
import { useSeason } from '../contexts/SeasonContext';
import { MatchService } from '../services';
import { MatchDetails } from '../types/models';
import { formatDate } from '../lib/utils';
import { toast } from 'sonner';

interface TopPerformer {
  player_id: string;
  first_name: string;
  last_name: string;
  image_url: string;
  goals: number;
  assists: number;
}

export default function StatisticsView() {
  const { activeTeam } = useTeam();
  const { activeSeason } = useSeason();
  const [matches, setMatches] = useState<MatchDetails[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeTeam) {
      fetchData();
    }
  }, [activeTeam, activeSeason]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [matchesData, performersData] = await Promise.all([
        MatchService.getAll(activeTeam?.id, activeSeason?.id),
        MatchService.getTopPerformers(activeTeam!.id, activeSeason?.id)
      ]);
      
      const finishedMatches = matchesData.filter(m => m.goalsFor !== undefined || m.goalsAgainst !== undefined);
      setMatches(finishedMatches);
      setTopPerformers(performersData);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    
    matches.forEach(m => {
      const gf = m.goalsFor || 0;
      const ga = m.goalsAgainst || 0;
      goalsFor += gf;
      goalsAgainst += ga;
      if (gf > ga) wins++;
      else if (gf < ga) losses++;
      else draws++;
    });

    const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;
    const cleanSheets = matches.filter(m => (m.goalsAgainst || 0) === 0).length;

    return { wins, draws, losses, goalsFor, goalsAgainst, total: matches.length, winRate, cleanSheets };
  }, [matches]);

  const recentForm = useMemo(() => {
    return matches.slice(-5).map(m => {
      const gf = m.goalsFor || 0;
      const ga = m.goalsAgainst || 0;
      if (gf > ga) return { type: 'W', color: 'bg-emerald-500', label: 'Win' };
      if (gf < ga) return { type: 'L', color: 'bg-rose-500', label: 'Loss' };
      return { type: 'D', color: 'bg-amber-500', label: 'Draw' };
    });
  }, [matches]);

  const chartData = matches.slice(-10).map((m) => ({
    name: m.opponent.split(' ')[0],
    gf: m.goalsFor,
    ga: m.goalsAgainst,
    diff: (m.goalsFor || 0) - (m.goalsAgainst || 0)
  }));

  const pieData = [
    { name: 'Wins', value: stats.wins, color: '#10b981' },
    { name: 'Draws', value: stats.draws, color: '#f59e0b' },
    { name: 'Losses', value: stats.losses, color: '#ef4444' },
  ].filter(d => d.value > 0);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background/50 backdrop-blur-xl">
        <div className="relative w-16 h-16">
           <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
           <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full w-full flex flex-col p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto overflow-y-auto custom-scrollbar gap-8">
      {/* Header with Glass Effect */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
             <div className="p-1.5 rounded-lg bg-emerald-500/10"><BarChart2 size={16} /></div>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Performance Hub</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Team Analytics</h1>
          <p className="text-muted text-sm font-medium">Detailed season breakdown for <span className="text-foreground">{activeTeam?.name}</span></p>
        </div>

        {/* Recent Form Indicators */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Recent Form</span>
          <div className="flex gap-1.5">
            {recentForm.length > 0 ? recentForm.map((f, i) => (
              <div 
                key={i} 
                className={`w-8 h-8 rounded-lg ${f.color} flex items-center justify-center text-white text-xs font-black shadow-lg shadow-${f.type === 'W' ? 'emerald' : f.type === 'L' ? 'rose' : 'amber'}-500/20 transition-transform hover:scale-110 cursor-default`}
                title={f.label}
              >
                {f.type}
              </div>
            )) : <span className="text-xs text-muted italic">No games played yet</span>}
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-surface/30 backdrop-blur-md rounded-[2.5rem] border border-dashed border-border/50">
          <div className="p-6 rounded-full bg-surface-raised mb-6 shadow-xl">
             <History size={48} className="text-muted opacity-30" />
          </div>
          <h3 className="text-2xl font-black text-foreground">Awaiting Season Data</h3>
          <p className="text-muted max-w-sm mt-3 text-lg">Record your first match result in the lineup section to unlock deep tactical analytics.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8 pb-12"
        >
          {/* Main Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatHeroCard 
              label="Win Rate" 
              value={`${stats.winRate}%`} 
              sub={`${stats.wins} Wins / ${stats.total} Total`} 
              icon={<Trophy className="text-emerald-500" />} 
              color="emerald" 
              trend={stats.winRate > 50 ? 'up' : 'down'}
            />
            <StatHeroCard 
              label="Avg Goals" 
              value={(stats.goalsFor / (stats.total || 1)).toFixed(2)} 
              sub={`${stats.goalsFor} goals scored`} 
              icon={<Zap className="text-amber-500" />} 
              color="amber" 
            />
            <StatHeroCard 
              label="Clean Sheets" 
              value={stats.cleanSheets} 
              sub={`${Math.round((stats.cleanSheets / (stats.total || 1)) * 100)}% of matches`} 
              icon={<Shield size={18} className="text-blue-500" />} 
              color="blue" 
            />
            <StatHeroCard 
              label="Goal Diff" 
              value={`${stats.goalsFor - stats.goalsAgainst > 0 ? '+' : ''}${stats.goalsFor - stats.goalsAgainst}`} 
              sub="Net efficiency" 
              icon={<Activity className="text-purple-500" />} 
              color="purple" 
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Scoring Trend Chart */}
            <motion.div variants={itemVariants} className="xl:col-span-8">
               <Card className="p-8 bg-surface/30 backdrop-blur-md border-border/50 h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-foreground">Scoring Performance</h3>
                      <p className="text-xs text-muted font-medium">Offensive vs Defensive trend over last 10 games</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-muted uppercase">Scored</span></div>
                       <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-[10px] font-bold text-muted uppercase">Conceded</span></div>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorGf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorGa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/20" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(var(--surface-rgb), 0.8)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ fontWeight: 700 }}
                        />
                        <Area type="monotone" dataKey="gf" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorGf)" />
                        <Area type="monotone" dataKey="ga" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorGa)" strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </Card>
            </motion.div>

            {/* Match Outcomes Distribution */}
            <motion.div variants={itemVariants} className="xl:col-span-4">
              <Card className="p-8 bg-surface/30 backdrop-blur-md border-border/50 h-full flex flex-col">
                <h3 className="text-xl font-black text-foreground mb-1">Outcome Distribution</h3>
                <p className="text-xs text-muted font-medium mb-8">Season victory ratio</p>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="h-[240px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-3xl font-black text-foreground">{stats.total}</span>
                       <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Games</span>
                    </div>
                  </div>

                  <div className="w-full space-y-3 mt-8">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-raised/50 border border-border/40">
                         <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-xs font-bold text-foreground">{d.name}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground">{d.value}</span>
                            <span className="text-[10px] font-bold text-muted">({Math.round((d.value/stats.total)*100)}%)</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Scorers Board */}
            <motion.div variants={itemVariants}>
               <LeaderboardCard 
                  title="Golden Boot" 
                  subtitle="Season Top Scorers" 
                  items={topPerformers.filter(p => p.goals > 0).slice(0, 5)} 
                  statKey="goals" 
                  statLabel="Goals"
                  icon={<Trophy className="text-amber-400" />}
                  teamName={activeTeam?.name || ''}
               />
            </motion.div>

            {/* Top Assisters Board */}
            <motion.div variants={itemVariants}>
               <LeaderboardCard 
                  title="Playmakers" 
                  subtitle="Season Top Assisters" 
                  items={topPerformers.filter(p => p.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 5)} 
                  statKey="assists" 
                  statLabel="Assists"
                  icon={<Award className="text-blue-400" />}
                  teamName={activeTeam?.name || ''}
               />
            </motion.div>
          </div>

          {/* Detailed Match History */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden bg-surface/30 backdrop-blur-md border-border/50">
              <div className="p-8 border-b border-border/50 bg-surface-raised/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-foreground">Match Archive</h3>
                  <p className="text-xs text-muted font-medium">Comprehensive game-by-game breakdown</p>
                </div>
                <div className="flex items-center gap-4 bg-surface rounded-2xl px-4 py-2 border border-border/50">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      <span className="text-[10px] font-black text-muted uppercase">W</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                      <span className="text-[10px] font-black text-muted uppercase">D</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                      <span className="text-[10px] font-black text-muted uppercase">L</span>
                   </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted border-b border-border/50">
                      <th className="px-8 py-5">Game Outcome</th>
                      <th className="px-8 py-5">Opponent</th>
                      <th className="px-8 py-5 text-center">Scoreline</th>
                      <th className="px-8 py-5">Matchday</th>
                      <th className="px-8 py-5">Venue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {matches.slice().reverse().map(m => {
                      const isWin = (m.goalsFor || 0) > (m.goalsAgainst || 0);
                      const isLoss = (m.goalsFor || 0) < (m.goalsAgainst || 0);

                      return (
                        <tr key={m.id} className="hover:bg-primary/[0.03] transition-all group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full ${isWin ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : isLoss ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                              <span className={`text-xs font-black uppercase tracking-widest ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-amber-500'}`}>
                                {isWin ? 'Victory' : isLoss ? 'Defeat' : 'Draw'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">vs {m.opponent}</span>
                                <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">Season {activeSeason?.name}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-raised border border-border/60 shadow-inner">
                              <span className={`text-base font-black ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-foreground'}`}>{m.goalsFor}</span>
                              <span className="text-muted font-bold">:</span>
                              <span className={`text-base font-black ${isLoss ? 'text-emerald-500' : isWin ? 'text-rose-500' : 'text-foreground'}`}>{m.goalsAgainst}</span>
                            </span>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2 text-xs text-muted font-bold">
                                <History size={12} className="opacity-50" />
                                {formatDate(m.date)}
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2 text-xs text-muted font-bold">
                                <Target size={12} className="opacity-50 text-blue-500" />
                                {m.location}
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function StatHeroCard({ label, value, sub, icon, color, trend }: { label: string, value: any, sub: string, icon: React.ReactNode, color: string, trend?: 'up' | 'down' }) {
  const colors: any = {
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-500',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-500',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-500',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-500'
  };

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={`p-6 bg-gradient-to-br ${colors[color]} border backdrop-blur-xl relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-surface/50 border border-current/10 shadow-sm">
             {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-surface/50 border border-current/10`}>
               {trend === 'up' ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-rose-500" />}
               <span className={trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>{trend === 'up' ? 'Top Tier' : 'Growing'}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{label}</p>
          <p className="text-4xl font-black text-foreground tracking-tighter">{value}</p>
          <p className="text-xs text-muted/80 font-medium">{sub}</p>
        </div>
      </Card>
    </motion.div>
  );
}

function LeaderboardCard({ title, subtitle, items, statKey, statLabel, icon, teamName }: { title: string, subtitle: string, items: any[], statKey: string, statLabel: string, icon: React.ReactNode, teamName: string }) {
  return (
    <Card className="p-8 bg-surface/30 backdrop-blur-md border-border/50 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-surface-raised border border-border/50 shadow-sm">
              {icon}
           </div>
           <div>
              <h3 className="text-xl font-black text-foreground">{title}</h3>
              <p className="text-xs text-muted font-medium">{subtitle}</p>
           </div>
        </div>
        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Full Table</button>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="py-12 text-center">
             <p className="text-xs text-muted italic font-medium">No performance data recorded yet</p>
          </div>
        ) : items.map((item, index) => (
          <div key={item.player_id} className="group relative flex items-center justify-between p-4 rounded-[1.25rem] bg-surface-raised/40 border border-border/30 hover:bg-primary/[0.03] hover:border-primary/20 transition-all duration-300">
             <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-surface border border-border text-muted'}`}>
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border/50 overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                        <Users size={20} />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                   <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{item.first_name} {item.last_name}</p>
                   <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{teamName}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-xl font-black text-foreground">{item[statKey]}</p>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{statLabel}</p>
             </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="px-4 py-3 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
           <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
           <p className="text-xs font-black text-foreground uppercase tracking-widest">{data.name}</p>
        </div>
        <p className="text-xl font-black text-foreground">{data.value} <span className="text-xs font-bold text-muted uppercase">Games</span></p>
      </div>
    );
  }
  return null;
}

function Shield({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
