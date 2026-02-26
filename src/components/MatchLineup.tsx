import { useState, useEffect } from 'react';
import { Save, X, Calendar, MapPin, Users, Plus, Trophy, Edit2, ChevronRight } from 'lucide-react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { DatePicker } from "./ui/DatePicker";
import { TimePicker } from "./ui/TimePicker";

// --- Types ---
interface Player {
  id: string; 
  name: string; 
  position: string; 
  number: number;
  status: string;
  performance?: number;
  dateOfBirth?: string;
}

interface MatchDetails {
    id: string;
    opponent: string;
    date: string;
    time: string;
    location: string;
    formation?: string; 
    lineup?: string; // JSON String from backend
}

interface PositionSlot { id: string; position: string; x: number; y: number; }

interface LineupPlayer extends Player { positionSlot: string; isStarter: boolean; }

// --- Formation Coordinate Maps ---
const FORMATIONS: Record<string, PositionSlot[]> = {
  '4-4-2': [
    { id: 'gk', position: 'GK', x: 50, y: 90 },
    { id: 'lb', position: 'LB', x: 15, y: 70 }, { id: 'lcb', position: 'CB', x: 38, y: 75 }, { id: 'rcb', position: 'CB', x: 62, y: 75 }, { id: 'rb', position: 'RB', x: 85, y: 70 },
    { id: 'lm', position: 'LM', x: 15, y: 45 }, { id: 'lcm', position: 'CM', x: 38, y: 50 }, { id: 'rcm', position: 'CM', x: 62, y: 50 }, { id: 'rm', position: 'RM', x: 85, y: 45 },
    { id: 'lst', position: 'ST', x: 35, y: 20 }, { id: 'rst', position: 'ST', x: 65, y: 20 },
  ],
  '4-3-3': [
    { id: 'gk', position: 'GK', x: 50, y: 90 },
    { id: 'lb', position: 'LB', x: 15, y: 70 }, { id: 'lcb', position: 'CB', x: 38, y: 75 }, { id: 'rcb', position: 'CB', x: 62, y: 75 }, { id: 'rb', position: 'RB', x: 85, y: 70 },
    { id: 'cdm', position: 'CDM', x: 50, y: 58 }, 
    { id: 'lcm', position: 'CM', x: 35, y: 45 }, { id: 'rcm', position: 'CM', x: 65, y: 45 },
    { id: 'lw', position: 'LW', x: 15, y: 25 }, { id: 'st', position: 'ST', x: 50, y: 15 }, { id: 'rw', position: 'RW', x: 85, y: 25 },
  ],
  '3-5-2': [
    { id: 'gk', position: 'GK', x: 50, y: 90 },
    { id: 'lcb', position: 'CB', x: 25, y: 75 }, { id: 'cb', position: 'CB', x: 50, y: 80 }, { id: 'rcb', position: 'CB', x: 75, y: 75 },
    { id: 'lwb', position: 'LWB', x: 10, y: 50 }, { id: 'lcm', position: 'CM', x: 35, y: 55 }, { id: 'cdm', position: 'CDM', x: 50, y: 65 }, { id: 'rcm', position: 'CM', x: 65, y: 55 }, { id: 'rwb', position: 'RWB', x: 90, y: 50 },
    { id: 'lst', position: 'ST', x: 40, y: 20 }, { id: 'rst', position: 'ST', x: 60, y: 20 },
  ]
};

// --- Sub-Components ---

function DraggablePlayer({ player, onClick, isSubstitute = false }: { player: Player; onClick?: () => void; isSubstitute?: boolean }) {
  const [{ isDragging }, drag] = useDrag(() => ({ 
      type: 'player', 
      item: { ...player, fromBench: isSubstitute }, 
      collect: (monitor) => ({ isDragging: !!monitor.isDragging() }) 
  }));
  
  return (
    <div ref={drag} onClick={onClick} className={`bg-slate-900/50 border border-white/5 rounded-xl p-3 cursor-pointer hover:border-blue-500/50 hover:bg-slate-800 transition-all flex items-center gap-3 ${isDragging ? 'opacity-50' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${isSubstitute ? 'bg-slate-600' : 'bg-blue-600'}`}>{player.number}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-200 truncate">{player.name}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{player.position}</p>
        </div>
    </div>
  );
}

function PositionSlotComponent({ slot, player, onDrop, onRemove, onClick, isMatchPast }: { slot: PositionSlot; player: LineupPlayer | null; onDrop: (p: any, s: string) => void; onRemove: (s: string) => void; onClick: () => void; isMatchPast: boolean; }) {
  const [{ isOver }, drop] = useDrop(() => ({ 
      accept: 'player', 
      drop: (item: any) => onDrop(item, slot.id), 
      collect: (monitor) => ({ isOver: !!monitor.isOver() }) 
  }), [onDrop, slot.id]);

  return (
    <div ref={drop} style={{ left: `${slot.x}%`, top: `${slot.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110">
      {player ? (
        <div onClick={onClick} className="relative group cursor-pointer">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border-2 border-blue-400"><span className="text-lg font-bold">{player.number}</span></div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"><p className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded border border-white/10">{player.name.split(' ')[0]}</p></div>
          {!isMatchPast && <button onClick={(e) => { e.stopPropagation(); onRemove(slot.id); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X className="w-3 h-3" /></button>}
        </div>
      ) : (
        <div className={`w-14 h-14 border-2 border-dashed rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isOver ? 'border-blue-400 bg-blue-500/20 text-white' : 'border-white/20 bg-white/5 text-slate-400'}`}>{slot.position}</div>
      )}
    </div>
  );
}

// --- Main Component ---

export default function MatchLineup() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [lineup, setLineup] = useState<Map<string, LineupPlayer>>(new Map());
  const [substitutes, setSubstitutes] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LineupPlayer | null>(null);
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCreateMatchModal, setShowCreateMatchModal] = useState(false);

  const [matches, setMatches] = useState<MatchDetails[]>([]); 
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null); 
  const [selectedPlayerPerformance, setSelectedPlayerPerformance] = useState(0);
  
  const [isEditingMatch, setIsEditingMatch] = useState(false);
  const [matchForm, setMatchForm] = useState({ opponent: '', date: '', time: '', location: '' });
  const [showPastMatches, setShowPastMatches] = useState(false);

  const [currentFormation, setCurrentFormation] = useState<string>('4-4-2');
  const [formationSource, setFormationSource] = useState<string>('Default');
  
  // AI Recommendation Storage
  const [aiSuggestedFormation, setAiSuggestedFormation] = useState<string>('4-4-2');
  const [aiSourceLabel, setAiSourceLabel] = useState<string>('AI Recommendation'); 

  // --- 1. Load Data ---
  useEffect(() => {
    // Players
    fetch('http://127.0.0.1:8000/players')
      .then(res => res.json())
      .then(data => {
          const mappedPlayers = data.map((p: any) => ({
              id: p.id,
              name: `${p.first_name} ${p.last_name}`,
              position: p.position,
              number: p.jersey_number,
              status: p.status,
              performance: p.performance || 0,
              dateOfBirth: p.date_of_birth
          }));
          setAllPlayers(mappedPlayers);
      });

    // Matches
    fetch('http://127.0.0.1:8000/matches')
        .then(res => res.json())
        .then(data => {
            setMatches(data);
            if (data.length > 0) setMatchDetails(data[0]);
        });

    // AI Formation
    fetch('http://127.0.0.1:8000/match/suggested-formation')
      .then(res => res.json())
      .then(data => {
        if (data.formation && FORMATIONS[data.formation]) {
            // FIX: Just store the data, do NOT force set currentFormation here.
            // The useEffect below will handle the UI update based on this data.
            setAiSuggestedFormation(data.formation);
            setAiSourceLabel(data.source);
        }
      });
  }, []);

  // --- 2. Switch Match Logic (Reactive to AI Data) ---
useEffect(() => {
      if (!matchDetails) return;

      // Helper to check if lineup has real data
      const hasSavedLineup = matchDetails.lineup && matchDetails.lineup !== "[]";

      if (hasSavedLineup) {
          // A. Saved Match (Real data exists) -> Always load saved strategy
          setCurrentFormation(matchDetails.formation || '4-4-2');
          setFormationSource('Saved Strategy');
          
          try {
              const parsedArray = JSON.parse(matchDetails.lineup!);
              const newLineup = new Map<string, LineupPlayer>();
              parsedArray.forEach((item: any) => {
                  newLineup.set(item.slotId, item.player);
              });
              setLineup(newLineup);
          } catch (e) {
              console.error("Error parsing lineup", e);
              setLineup(new Map());
          }
      } else {
          // B. Fresh or Empty Match
          
          // 1. Calculate Date Difference
          const matchDate = new Date(matchDetails.date);
          const today = new Date();
          // Reset hours to compare dates only
          today.setHours(0, 0, 0, 0);
          matchDate.setHours(0, 0, 0, 0);
          
          const diffTime = matchDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // 2. Apply Logic: Only suggest if match is within next 7 days (and not in the past)
          const isUpcomingSoon = diffDays >= 0 && diffDays <= 7;

          if (isUpcomingSoon && aiSuggestedFormation && FORMATIONS[aiSuggestedFormation]) {
              setCurrentFormation(aiSuggestedFormation);
              setFormationSource(aiSourceLabel); // "Based on..."
          } else {
              setCurrentFormation('4-4-2');
              setFormationSource('Default'); // Far future match -> Default
          }
          
          setLineup(new Map()); 
      }
      
      setSubstitutes([]); 

  }, [matchDetails, aiSuggestedFormation, aiSourceLabel]);
  // --- Handlers ---
  const handleOpenCreate = () => { setMatchForm({ opponent: '', date: '', time: '', location: '' }); setIsEditingMatch(false); setShowCreateMatchModal(true); };
  
  const handleOpenEdit = () => { 
      if (!matchDetails) return; 
      setMatchForm({ opponent: matchDetails.opponent, date: matchDetails.date, time: matchDetails.time, location: matchDetails.location }); 
      setIsEditingMatch(true); 
      setShowCreateMatchModal(true); 
  };

  const handleSaveMatch = async () => {
    if (!matchForm.opponent || !matchForm.date) return toast.error("Opponent and Date required");
    try {
        const url = isEditingMatch && matchDetails ? `http://127.0.0.1:8000/matches/${matchDetails.id}` : 'http://127.0.0.1:8000/matches';
        const method = isEditingMatch ? 'PUT' : 'POST';
        
        const payload = isEditingMatch && matchDetails 
            ? { ...matchDetails, ...matchForm }
            : { ...matchForm, formation: currentFormation };

        const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

        if (response.ok) {
            const savedMatch = await response.json();
            if (isEditingMatch) { 
                setMatches(prev => prev.map(m => m.id === savedMatch.id ? savedMatch : m)); 
            } else { 
                setMatches(prev => [...prev, savedMatch].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())); 
            }
            setMatchDetails(savedMatch);
            setShowCreateMatchModal(false);
            toast.success(isEditingMatch ? "Match updated!" : "Match created!");
        }
    } catch (e) { toast.error("Failed to save match"); }
  };

  const availablePlayers = allPlayers.filter(player => 
      player.status === 'Active' && 
      !Array.from(lineup.values()).some(lp => lp.id === player.id) && 
      !substitutes.some(sp => sp.id === player.id)
  );
  
  // Separate past and upcoming matches
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingMatches = matches.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastMatches = matches.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate < today;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Check if currently viewing a past match
  const isMatchPast = matchDetails ? (() => {
    const matchDate = new Date(matchDetails.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate < today;
  })() : false;
  
  const activeSlots = FORMATIONS[currentFormation] || FORMATIONS['4-4-2'];

  // Calculate average performance for a player from past matches
  const getPlayerAveragePerformance = (playerId: string): number | null => {
    const playerPastPerformances: number[] = [];
    pastMatches.forEach(match => {
      if (match.lineup) {
        try {
          const parsedLineup = JSON.parse(match.lineup);
          parsedLineup.forEach((item: any) => {
            if (item.player.id === playerId && item.player.performance) {
              playerPastPerformances.push(item.player.performance);
            }
          });
        } catch (e) {
          // Ignore parse errors
        }
      }
    });
    
    // Also add the current performance from allPlayers if it exists
    const playerFromDb = allPlayers.find(p => p.id === playerId);
    if (playerFromDb && playerFromDb.performance && playerFromDb.performance > 0) {
      playerPastPerformances.push(playerFromDb.performance);
    }
    
    if (playerPastPerformances.length === 0) return null;
    const avg = playerPastPerformances.reduce((a, b) => a + b, 0) / playerPastPerformances.length;
    return Math.round(avg * 10) / 10; // Round to 1 decimal
  };

  const handleDropToField = (item: any, slotId: string) => {
    if (isMatchPast) {
      toast.error('Cannot edit past match lineups');
      return;
    }
    const player = item as Player;
    const fromBench = item.fromBench;

    if (fromBench) {
        setSubstitutes(prev => prev.filter(p => p.id !== player.id));
    }

    setLineup(prevLineup => {
        const newLineup = new Map(prevLineup);
        for (const [key, val] of newLineup.entries()) {
            if (val.id === player.id) {
                newLineup.delete(key);
                break;
            }
        }
        newLineup.set(slotId, { ...player, positionSlot: slotId, isStarter: true });
        return newLineup;
    });
    
    toast.success(`${player.name} set`);
  };

  const handleRemoveFromField = (slotId: string) => {
    setLineup(prev => {
        const newMap = new Map(prev);
        newMap.delete(slotId);
        return newMap;
    });
  };

  const handleAddSubstitute = (player: Player) => {
      setSubstitutes(prev => [...prev, player]);
  };

  const handleSaveLineup = async () => {
    if (lineup.size < 11) return toast.error('Lineup incomplete (need 11 players)');
    if (!matchDetails) return;

    try {
        const lineupArray = Array.from(lineup.entries()).map(([slotId, player]) => ({
            slotId,
            player
        }));

        const response = await fetch(`http://127.0.0.1:8000/matches/${matchDetails.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...matchDetails,
                formation: currentFormation,
                lineup: JSON.stringify(lineupArray) 
            })
        });

        if (response.ok) {
            const updatedMatch = await response.json();
            setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
            setMatchDetails(updatedMatch);
            setFormationSource('Saved Strategy');
            toast.success(`Lineup saved for ${updatedMatch.opponent}`);
            setShowSaveModal(false);
        }
    } catch (e) {
        toast.error("Failed to save lineup");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}> 
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white tracking-tight">Match & Lineup</h1><p className="text-slate-400 mt-1 font-medium">Tactical setup for matchday</p></div>
        <div className="flex gap-3">
            <Button onClick={handleOpenCreate} variant="secondary" icon={<Plus size={18} />}>Create Match</Button>
            <Button onClick={() => setShowSaveModal(true)} disabled={lineup.size < 11 || isMatchPast} icon={<Save size={18} />}>{isMatchPast ? 'Past Match (View Only)' : 'Save Lineup'}</Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {matchDetails && !isMatchPast ? (
                <>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-slate-500 text-lg">VS</span> {matchDetails.opponent}</h3>
                        <button onClick={handleOpenEdit} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"><Edit2 size={16} /></button>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm text-slate-400 font-medium">
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {matchDetails.date}</span>
                        <span className="flex items-center gap-2"><Users size={14} className="text-blue-500" /> {matchDetails.time || 'TBD'}</span>
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> {matchDetails.location || 'Home'}</span>
                    </div>
                </>
            ) : (
                <div className="text-slate-500 flex items-center gap-3">
                    <Trophy size={24} className="opacity-50"/>
                    <div><h3 className="text-lg font-bold text-slate-400">No Upcoming Match</h3><p className="text-sm">Click "Create Match" to schedule.</p></div>
                </div>
            )}
          </div>
          <div className="text-right border-l border-white/5 pl-6">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Recommended Formation</p>
            <p className="text-3xl font-bold text-emerald-400 font-mono tracking-tight">{currentFormation}</p>
            <p className="text-[10px] text-slate-600 mt-1">{formationSource}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="p-4 flex flex-col h-[250px]">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowPastMatches(false)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                  !showPastMatches
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                    : 'bg-slate-900/50 text-slate-400 border border-white/5'
                }`}
              >
                Upcoming ({upcomingMatches.length})
              </button>
              <button
                onClick={() => setShowPastMatches(true)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                  showPastMatches
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                    : 'bg-slate-900/50 text-slate-400 border border-white/5'
                }`}
              >
                Past ({pastMatches.length})
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {(!showPastMatches ? upcomingMatches : pastMatches).length > 0 ? (
                  (!showPastMatches ? upcomingMatches : pastMatches).map(match => (
                    <div key={match.id} onClick={() => setMatchDetails(match)} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${matchDetails?.id === match.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-slate-900/50 border-white/5 hover:border-white/20'}`}>
                        <div>
                          <p className={`text-sm font-bold ${matchDetails?.id === match.id ? 'text-blue-400' : 'text-slate-200'}`}>vs {match.opponent}</p>
                          <p className="text-[10px] text-slate-500">{match.date}</p>
                        </div>
                        {matchDetails?.id === match.id && <ChevronRight size={14} className="text-blue-400" />}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center mt-10">No {showPastMatches ? 'past' : 'upcoming'} matches</p>
                )}
            </div>
          </Card>

          <Card className="p-4 h-[350px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Available Players</h3>
              {isMatchPast && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">View Only</span>}
            </div>
            <div className={`space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2 ${isMatchPast ? 'opacity-60 pointer-events-none' : ''}`}>
              {availablePlayers.length > 0 ? availablePlayers.map(player => 
                <DraggablePlayer key={player.id} player={player} onClick={() => !isMatchPast && handleAddSubstitute(player)} />
              ) : <p className="text-xs text-slate-500 italic text-center mt-10">No active players available</p>}
            </div>
          </Card>

          <Card className="p-4 h-[200px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Substitutes</h3>
              {isMatchPast && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">View Only</span>}
            </div>
            <div className={`space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2 ${isMatchPast ? 'opacity-60' : ''}`}>
              {substitutes.map(player => (
                <DraggablePlayer key={player.id} player={player} isSubstitute={true} />
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <Card className="p-8 bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-900/50 relative overflow-hidden" style={{ minHeight: '848px' }}>
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 49px, #fff 50px)' }}></div>
            <div className="absolute inset-8 border-2 border-emerald-400/20 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-emerald-400/20 border-t-0 rounded-b-lg"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-emerald-400/20 border-b-0 rounded-t-lg"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0 border-t-2 border-emerald-400/20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-emerald-400/20 rounded-full"></div>
            </div>
            <div className="absolute inset-8">
              {activeSlots.map((slot) => <PositionSlotComponent key={slot.id} slot={slot} player={lineup.get(slot.id) || null} onDrop={handleDropToField} onRemove={handleRemoveFromField} onClick={() => { const p = lineup.get(slot.id); if (p) { setSelectedPlayer(p); setSelectedPlayerPerformance(p.performance || 0); } }} isMatchPast={isMatchPast} />)}
            </div>
            <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Starters</p>
              <p className="text-xl font-bold text-white">{lineup.size} / 11</p>
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={!!selectedPlayer} onClose={() => setSelectedPlayer(null)} title="Player Profile" icon={<Users size={20}/>} maxWidth="max-w-md">
        {selectedPlayer && (
            <div className="text-center space-y-6">
                <div>
                  <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/30 border-4 border-slate-900">{selectedPlayer.number}</div>
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedPlayer.name}</h3>
                  <p className="text-blue-400 font-medium">{selectedPlayer.position}</p>
                </div>
                
                <div className="w-full space-y-4">
                    {isMatchPast ? (
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">Match Performance</p>
                        <div className="space-y-3">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={selectedPlayerPerformance}
                            onChange={(e) => setSelectedPlayerPerformance(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-6 rounded-sm transition-all ${
                                    i < selectedPlayerPerformance
                                      ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
                                      : 'bg-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-blue-400">{selectedPlayerPerformance}</p>
                              <p className="text-xs text-slate-500">/10</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-xs text-slate-500">
                            {selectedPlayerPerformance <= 3 && '🔴 Below Average'}
                            {selectedPlayerPerformance > 3 && selectedPlayerPerformance <= 5 && '🟡 Average'}
                            {selectedPlayerPerformance > 5 && selectedPlayerPerformance <= 7 && '🟢 Good'}
                            {selectedPlayerPerformance > 7 && selectedPlayerPerformance <= 9 && '⭐ Excellent'}
                            {selectedPlayerPerformance === 10 && '👑 Outstanding'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">Average Performance</p>
                        {getPlayerAveragePerformance(selectedPlayer.id) !== null ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1">
                                {[...Array(10)].map((_, i) => {
                                  const avg = getPlayerAveragePerformance(selectedPlayer.id) || 0;
                                  return (
                                    <div
                                      key={i}
                                      className={`w-2 h-6 rounded-sm transition-all ${
                                        i < Math.round(avg)
                                          ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                                          : 'bg-slate-700'
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-bold text-emerald-400">{getPlayerAveragePerformance(selectedPlayer.id)}</p>
                                <p className="text-xs text-slate-500">/10</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500">
                              {(() => {
                                const avg = getPlayerAveragePerformance(selectedPlayer.id) || 0;
                                if (avg <= 3) return '🔴 Below Average';
                                if (avg <= 5) return '🟡 Average';
                                if (avg <= 7) return '🟢 Good';
                                if (avg <= 9) return '⭐ Excellent';
                                return '👑 Outstanding';
                              })()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic">No past match data available</p>
                        )}
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-white/5">
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Status</p>
                      <p className={`text-lg font-bold mt-2 ${
                        selectedPlayer.status === 'Active' 
                          ? 'text-emerald-400' 
                          : selectedPlayer.status === 'Injured'
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}>
                        {selectedPlayer.status}
                      </p>
                    </div>
                </div>
                
                <Button 
                  onClick={async () => {
                    if (isMatchPast) {
                      try {
                        // Get full player data from allPlayers to ensure we have dateOfBirth
                        const fullPlayerData = allPlayers.find(p => p.id === selectedPlayer.id) || selectedPlayer;
                        
                        // Update player performance in backend
                        const response = await fetch(`http://127.0.0.1:8000/players/${selectedPlayer.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            first_name: selectedPlayer.name.split(' ')[0],
                            last_name: selectedPlayer.name.split(' ').slice(1).join(' ') || '',
                            position: selectedPlayer.position,
                            jersey_number: selectedPlayer.number,
                            status: selectedPlayer.status,
                            performance: selectedPlayerPerformance,
                            date_of_birth: fullPlayerData.dateOfBirth
                          })
                        });
                        
                        if (response.ok) {
                          const updatedPlayer = await response.json();
                          const updatedPlayers = allPlayers.map(p => p.id === selectedPlayer.id 
                            ? { ...p, performance: updatedPlayer.performance } 
                            : p
                          );
                          setAllPlayers(updatedPlayers);
                          toast.success('Performance updated');
                        }
                      } catch (e) {
                        toast.error('Failed to save performance');
                      }
                    }
                    setSelectedPlayer(null);
                  }}
                  disabled={!isMatchPast}
                  className="w-full"
                >
                  {isMatchPast ? 'Save Performance' : 'Upcoming Match (View Only)'}
                </Button>
            </div>
        )}
      </Modal>

      <Modal isOpen={showCreateMatchModal} onClose={() => setShowCreateMatchModal(false)} title={isEditingMatch ? "Edit Match" : "Create New Match"} maxWidth="max-w-md"
        footer={<div className="flex gap-3"><Button variant="ghost" onClick={() => setShowCreateMatchModal(false)} className="flex-1">Cancel</Button><Button onClick={handleSaveMatch} className="flex-1">{isEditingMatch ? "Update Match" : "Create Match"}</Button></div>}>
        <div className="space-y-4">
            <Input label="Opponent Name" value={matchForm.opponent} onChange={e => setMatchForm({...matchForm, opponent: e.target.value})} placeholder="e.g. City Rovers FC" />
            <DatePicker label="Match Date" value={matchForm.date} onChange={date => setMatchForm({...matchForm, date})} />
            <div className="grid grid-cols-2 gap-4">
                <TimePicker label="Kickoff Time" value={matchForm.time} onChange={time => setMatchForm({...matchForm, time})} />
                <Input label="Location" value={matchForm.location} onChange={e => setMatchForm({...matchForm, location: e.target.value})} placeholder="e.g. Home / Away" />
            </div>
        </div>
      </Modal>

      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} title="Confirm Lineup" maxWidth="max-w-sm" 
        footer={<div className="flex gap-3"><Button variant="ghost" onClick={() => setShowSaveModal(false)} className="flex-1">Cancel</Button><Button onClick={handleSaveLineup} className="flex-1">Confirm</Button></div>}>
        <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Match</span><span className="text-white font-bold">{matchDetails?.opponent || 'Unscheduled'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Formation</span><span className="text-emerald-400 font-bold font-mono">{currentFormation}</span></div>
            </div>
            <p className="text-sm text-slate-400 text-center">Save this lineup for {matchDetails ? matchDetails.opponent : 'the upcoming match'}?</p>
        </div>
      </Modal>
    </div>
    </DndProvider>
  );
}