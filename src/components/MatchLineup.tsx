import { useState } from 'react';
import { Save, X, Calendar, MapPin, Users } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { toast } from 'sonner';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

interface Player {
  id: number; name: string; position: string; number: number;
}

const mockPlayers: Player[] = [
  { id: 1, name: 'Alex Johnson', position: 'Forward', number: 9 },
  { id: 2, name: 'Sam Martinez', position: 'Midfielder', number: 10 },
  { id: 3, name: 'Jordan Lee', position: 'Defender', number: 4 },
  { id: 4, name: 'Taylor Brown', position: 'Goalkeeper', number: 1 },
  { id: 5, name: 'Casey Wilson', position: 'Midfielder', number: 8 },
  { id: 6, name: 'Morgan Davis', position: 'Forward', number: 11 },
  { id: 7, name: 'River Thompson', position: 'Defender', number: 5 },
  { id: 8, name: 'Avery Garcia', position: 'Midfielder', number: 7 },
  { id: 9, name: 'Jamie Parker', position: 'Defender', number: 3 },
  { id: 10, name: 'Riley Chen', position: 'Defender', number: 2 },
  { id: 11, name: 'Cameron White', position: 'Midfielder', number: 6 },
];

interface PositionSlot { id: string; position: string; x: number; y: number; }

const formationPositions: PositionSlot[] = [
  { id: 'gk-1', position: 'GK', x: 50, y: 90 },
  { id: 'lb-1', position: 'LB', x: 20, y: 70 },
  { id: 'cb-1', position: 'CB', x: 40, y: 70 },
  { id: 'cb-2', position: 'CB', x: 60, y: 70 },
  { id: 'rb-1', position: 'RB', x: 80, y: 70 },
  { id: 'lm-1', position: 'LM', x: 20, y: 45 },
  { id: 'cm-1', position: 'CM', x: 40, y: 45 },
  { id: 'cm-2', position: 'CM', x: 60, y: 45 },
  { id: 'rm-1', position: 'RM', x: 80, y: 45 },
  { id: 'st-1', position: 'ST', x: 35, y: 20 },
  { id: 'st-2', position: 'ST', x: 65, y: 20 },
];

interface LineupPlayer extends Player { positionSlot: string; isStarter: boolean; }

function DraggablePlayer({ player, onClick }: { player: Player; onClick: () => void; }) {
  const [{ isDragging }, drag] = useDrag(() => ({ type: 'player', item: player, collect: (monitor) => ({ isDragging: !!monitor.isDragging() }) }));
  
  return (
    <div ref={drag} onClick={onClick} className={`bg-slate-900/50 border border-white/5 rounded-xl p-3 cursor-pointer hover:border-blue-500/50 hover:bg-slate-800 transition-all ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">{player.number}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-200 truncate">{player.name}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{player.position}</p>
        </div>
      </div>
    </div>
  );
}

function PositionSlotComponent({ slot, player, onDrop, onRemove, onClick }: { slot: PositionSlot; player: LineupPlayer | null; onDrop: (p: Player, s: string) => void; onRemove: (s: string) => void; onClick: () => void; }) {
  const [{ isOver }, drop] = useDrop(() => ({ accept: 'player', drop: (item: Player) => onDrop(item, slot.id), collect: (monitor) => ({ isOver: !!monitor.isOver() }) }));

  return (
    <div ref={drop} style={{ left: `${slot.x}%`, top: `${slot.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110">
      {player ? (
        <div onClick={onClick} className="relative group cursor-pointer">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border-2 border-blue-400">
            <span className="text-lg font-bold">{player.number}</span>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <p className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded border border-white/10">{player.name.split(' ')[0]}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRemove(slot.id); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className={`w-14 h-14 border-2 border-dashed rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isOver ? 'border-blue-400 bg-blue-500/20 text-white' : 'border-white/20 bg-white/5 text-slate-400'}`}>
          {slot.position}
        </div>
      )}
    </div>
  );
}

export default function MatchLineup() {
  const [lineup, setLineup] = useState<Map<string, LineupPlayer>>(new Map());
  const [substitutes, setSubstitutes] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LineupPlayer | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const availablePlayers = mockPlayers.filter(player => !Array.from(lineup.values()).some(lp => lp.id === player.id) && !substitutes.some(sp => sp.id === player.id));

  const handleDropToField = (player: Player, slotId: string) => {
    const newLineup = new Map(lineup);
    newLineup.set(slotId, { ...player, positionSlot: slotId, isStarter: true });
    setLineup(newLineup);
    toast.success(`${player.name} added to lineup`);
  };

  const handleRemoveFromField = (slotId: string) => {
    const newLineup = new Map(lineup);
    newLineup.delete(slotId);
    setLineup(newLineup);
    toast.success('Player removed');
  };

  const handleAddSubstitute = (player: Player) => {
    setSubstitutes([...substitutes, player]);
    toast.success(`${player.name} added to subs`);
  };

  const handleSaveLineup = () => {
    if (lineup.size < 11) return toast.error('Lineup incomplete (need 11 players)');
    toast.success('Lineup saved successfully!');
    setShowSaveModal(false);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white tracking-tight">Match & Lineup</h1><p className="text-slate-400 mt-1 font-medium">Tactical setup for matchday</p></div>
        <Button onClick={() => setShowSaveModal(true)} disabled={lineup.size < 11} icon={<Save size={18} />}>Save Lineup</Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">U-17 Premier Team <span className="text-slate-500 mx-2">vs</span> City Rovers FC</h3>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> Sat, Dec 21, 2024</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> City Stadium (Away)</span>
              <span className="flex items-center gap-2"><Users size={14} className="text-blue-500" /> 10:00 AM Kickoff</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Formation</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">4-4-2</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="p-4 h-[400px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Available Players</h3>
            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {availablePlayers.map(player => <DraggablePlayer key={player.id} player={player} onClick={() => handleAddSubstitute(player)} />)}
              {availablePlayers.length === 0 && <p className="text-xs text-slate-500 italic text-center mt-10">All players assigned</p>}
            </div>
          </Card>

          <Card className="p-4 h-[300px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Substitutes</h3>
            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {substitutes.map(player => (
                <div key={player.id} className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold">{player.number}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-200 truncate">{player.name}</p><p className="text-[10px] text-slate-500 uppercase">{player.position}</p></div>
                </div>
              ))}
              {substitutes.length === 0 && <p className="text-xs text-slate-500 italic text-center mt-10">No substitutes selected</p>}
            </div>
          </Card>
        </div>

        {/* Field */}
        <div className="col-span-12 lg:col-span-9">
          <Card className="p-8 bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-900/50 relative overflow-hidden" style={{ minHeight: '724px' }}>
            {/* Field Patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 49px, #fff 50px)' }}></div>
            
            {/* Markings */}
            <div className="absolute inset-8 border-2 border-emerald-400/20 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-emerald-400/20 border-t-0 rounded-b-lg"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-emerald-400/20 border-b-0 rounded-t-lg"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0 border-t-2 border-emerald-400/20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-emerald-400/20 rounded-full"></div>
            </div>

            {/* Slots */}
            <div className="absolute inset-8">
              {formationPositions.map((slot) => <PositionSlotComponent key={slot.id} slot={slot} player={lineup.get(slot.id) || null} onDrop={handleDropToField} onRemove={handleRemoveFromField} onClick={() => { const p = lineup.get(slot.id); if (p) setSelectedPlayer(p); }} />)}
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
            <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/30 border-4 border-slate-900">{selectedPlayer.number}</div>
                <h3 className="text-2xl font-bold text-white mb-1">{selectedPlayer.name}</h3>
                <p className="text-blue-400 font-medium">{selectedPlayer.position}</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3 rounded-xl border border-white/5"><p className="text-xs text-slate-500 uppercase tracking-wider">Form</p><p className="text-xl font-bold text-emerald-400">8.5</p></div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-white/5"><p className="text-xs text-slate-500 uppercase tracking-wider">Fitness</p><p className="text-xl font-bold text-blue-400">95%</p></div>
                </div>
            </div>
        )}
      </Modal>

      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} title="Confirm Lineup" maxWidth="max-w-sm" 
        footer={<div className="flex gap-3"><Button variant="ghost" onClick={() => setShowSaveModal(false)} className="flex-1">Cancel</Button><Button onClick={handleSaveLineup} className="flex-1">Confirm</Button></div>}>
        <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Starters</span><span className="text-white font-bold">{lineup.size}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Subs</span><span className="text-white font-bold">{substitutes.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Formation</span><span className="text-emerald-400 font-bold font-mono">4-4-2</span></div>
            </div>
            <p className="text-sm text-slate-400 text-center">Ready to save this lineup for Saturday's match?</p>
        </div>
      </Modal>
    </div>
  );
}