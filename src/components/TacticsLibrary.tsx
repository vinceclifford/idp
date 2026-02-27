import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Modal } from "./ui/Modal";
import { ConfirmDialog } from "./ui/ConfirmDialog";

interface Tactic {
  id: string; name: string; formation: string; description: string;
  suggestedDrills?: string; isCustom: boolean;
}

export default function TacticsLibrary() {
  const [tactics, setTactics] = useState<Tactic[]>([]); // Initialize empty
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [formData, setFormData] = useState({ id: '', name: '', formation: '4-3-3', description: '', suggestedDrills: '' });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/tactics')
        .then(res => res.json())
        .then(data => {
            const dbItems = data.map((item: any) => ({ 
                id: item.id, name: item.name, formation: item.formation, description: item.description, suggestedDrills: item.suggested_drills || '', isCustom: true 
            }));
            setTactics(dbItems); // Only fetch from DB
        })
        .catch(() => toast.error("Backend offline"));
  }, []);

  const handleSave = async () => {
    if (!formData.name) return toast.error('Name required');
    try {
      let response;
      const payload = { name: formData.name, formation: formData.formation, description: formData.description, suggested_drills: formData.suggestedDrills };
      
      if (isEditing && formData.id) {
        response = await fetch(`http://127.0.0.1:8000/tactics/${formData.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        response = await fetch('http://127.0.0.1:8000/tactics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }

      if (response.ok) {
        const saved = await response.json();
        const newItem = { id: saved.id, name: saved.name, formation: saved.formation, description: saved.description, suggestedDrills: saved.suggested_drills || '', isCustom: true };
        if (isEditing) setTactics(prev => prev.map(t => t.id === newItem.id ? newItem : t));
        else setTactics(prev => [...prev, newItem]);
        toast.success(isEditing ? 'Updated!' : 'Created!');
        closeModal();
      }
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    try {
        await fetch(`http://127.0.0.1:8000/tactics/${id}`, { method: 'DELETE' });
        setTactics(prev => prev.filter(t => t.id !== id));
        toast.success('Deleted');
    } catch {
        toast.error("Failed to delete");
    }
  };

  const closeModal = () => { setShowCreateModal(false); setIsEditing(false); setFormData({ id: '', name: '', formation: '4-3-3', description: '', suggestedDrills: '' }); };
  const openEdit = (t: Tactic) => { setFormData({ id: t.id, name: t.name, formation: t.formation, description: t.description, suggestedDrills: t.suggestedDrills || '' }); setIsEditing(true); setShowCreateModal(true); };
  const filteredTactics = tactics.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full bg-emerald-500 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Tactics Library</h1>
            <p className="text-sm text-slate-400 mt-0.5">Systems & Formations</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={<Plus size={18}/>}>Create Tactic</Button>
      </div>

      <Card className="p-2 px-4">
        <Input icon={<Search size={18} />} placeholder="Search tactics..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border-0 bg-transparent focus:ring-0" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
        {filteredTactics.map((t, idx) => (
            <Card key={t.id} animate delay={idx * 0.05} className="p-5 hover:border-green-500/30 group flex flex-col h-full shadow-lg">
                <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl h-36 mb-5 flex items-center justify-center relative overflow-hidden shrink-0 group-hover:border-emerald-500/30 transition-colors">
                    <div className="absolute inset-3 border border-emerald-500/10 rounded"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-emerald-500/10 rounded-full"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 border-l border-emerald-500/10"></div>
                    
                    <div className="text-center z-10">
                        <span className="text-4xl font-bold text-emerald-400 block tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{t.formation}</span>
                        <span className="text-[10px] uppercase text-emerald-500/60 tracking-[0.2em] font-bold mt-2 block">System</span>
                    </div>
                </div>

                <div className="mb-4 px-1">
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{t.name}</h3>
                    <p className={`text-slate-400 text-sm leading-relaxed transition-all ${!expandedIds.has(t.id) ? 'line-clamp-3' : ''}`}>{t.description}</p>
                {t.description?.length > 120 && (
                  <button onClick={e => { e.stopPropagation(); toggleExpanded(t.id); }} className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 mt-1.5 transition-colors">
                    {expandedIds.has(t.id) ? 'Show less ↑' : 'Read more ↓'}
                  </button>
                )}
                </div>

                {t.suggestedDrills && (
                    <div className="bg-slate-950/50 border border-white/5 rounded-lg p-4 mb-4">
                        <h4 className="text-orange-400 text-[10px] uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Suggested Drills
                        </h4>
                        <div className="space-y-2">
                            {(expandedIds.has(t.id + '-drills')
                                ? t.suggestedDrills.split('\n')
                                : t.suggestedDrills.split('\n').slice(0, 3)
                            ).map((d, i) => d.trim() && (
                                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                    <span className="text-orange-500/50 mt-[3px] text-[8px]">•</span>
                                    <span>{d}</span>
                                </div>
                            ))}
                        </div>
                        {t.suggestedDrills.split('\n').filter(d => d.trim()).length > 3 && (
                          <button onClick={e => { e.stopPropagation(); toggleExpanded(t.id + '-drills'); }} className="text-[9px] font-semibold text-orange-400/70 hover:text-orange-400 mt-2 transition-colors">
                            {expandedIds.has(t.id + '-drills') ? 'Show less ↑' : `+${t.suggestedDrills.split('\n').filter(d => d.trim()).length - 3} more ↓`}
                          </button>
                        )}
                    </div>
                )}

                {t.isCustom && (
                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); openEdit(t); }} className="p-2 h-8 w-8"><Edit2 size={14} /></Button>
                          <Button variant="danger" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(t.id); }} className="p-2 h-8 w-8"><Trash2 size={14} /></Button>
                    </div>
                )}
            </Card>
        ))}
        </AnimatePresence>
        {filteredTactics.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 italic">
                No tactics found. Create one to get started.
            </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={closeModal} title={isEditing ? 'Edit Tactic' : 'New Tactic'}
        footer={<div className="flex gap-3"><Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button><Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20">Save</Button></div>}>
        <div className="space-y-6">
            <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Counter Attack" />
            <Select label="Formation" value={formData.formation} onChange={val => setFormData({...formData, formation: val as string})} options={['4-4-2', '4-3-3', '4-2-3-1', '4-3-2-1', '4-1-4-1', '4-1-2-1-2', '4-4-2 DM', '3-5-2', '3-4-3', '3-4-1-2', '5-3-2', '5-4-1'].map(f => ({label: f, value: f}))} />
            <div className="space-y-2"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none placeholder:text-slate-600 focus:bg-slate-900 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 hover:border-white/10 resize-none h-24 custom-scrollbar" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-orange-400">Suggested Drills (Line Separated)</label>
            <textarea className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none placeholder:text-slate-600 focus:bg-slate-900 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 hover:border-white/10 resize-none h-20 custom-scrollbar" value={formData.suggestedDrills} onChange={e => setFormData({...formData, suggestedDrills: e.target.value})} placeholder="Rondo&#10;Small Sided Game" /></div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Delete tactic?"
        message="This will permanently remove this tactic from the library."
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}