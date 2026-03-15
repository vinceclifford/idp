import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Upload, Video as VideoIcon, FileText, X, BookOpen, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadFile } from '../lib/uploadFile';

import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Modal } from "./ui/Modal";
import { ConfirmDialog } from "./ui/ConfirmDialog";

import { Principle } from '../types/models';
import { mapPrincipleFromApi, mapPrincipleToApi } from '../lib/data-mappers';

const GAME_PHASES = [
  "In Possession",
  "Transition After Losing Possession",
  "Out of Possession",
  "Transition After Winning Possession",
  "Set Pieces",
];

const PHASE_COLORS: Record<string, {
  bg: string; border: string; text: string; badge: string; badgeBg: string;
  dot: string; glow: string; tabActive: string; tabHover: string;
}> = {
  "In Possession": {
    bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400",
    badge: "text-emerald-300", badgeBg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-500", glow: "shadow-[0_0_8px_rgba(52,211,153,0.4)]",
    tabActive: "bg-emerald-500/15 border-emerald-500/50 text-emerald-400",
    tabHover: "hover:border-emerald-500/30 hover:text-emerald-400",
  },
  "Transition After Losing Possession": {
    bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400",
    badge: "text-amber-300", badgeBg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-500", glow: "shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    tabActive: "bg-amber-500/15 border-amber-500/50 text-amber-400",
    tabHover: "hover:border-amber-500/30 hover:text-amber-400",
  },
  "Out of Possession": {
    bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400",
    badge: "text-rose-300", badgeBg: "bg-rose-500/10 border-rose-500/20",
    dot: "bg-rose-500", glow: "shadow-[0_0_8px_rgba(244,63,94,0.4)]",
    tabActive: "bg-rose-500/15 border-rose-500/50 text-rose-400",
    tabHover: "hover:border-rose-500/30 hover:text-rose-400",
  },
  "Transition After Winning Possession": {
    bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-400",
    badge: "text-sky-300", badgeBg: "bg-sky-500/10 border-sky-500/20",
    dot: "bg-sky-500", glow: "shadow-[0_0_8px_rgba(14,165,233,0.4)]",
    tabActive: "bg-sky-500/15 border-sky-500/50 text-sky-400",
    tabHover: "hover:border-sky-500/30 hover:text-sky-400",
  },
  "Set Pieces": {
    bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400",
    badge: "text-violet-300", badgeBg: "bg-violet-500/10 border-violet-500/20",
    dot: "bg-violet-500", glow: "shadow-[0_0_8px_rgba(139,92,246,0.4)]",
    tabActive: "bg-violet-500/15 border-violet-500/50 text-violet-400",
    tabHover: "hover:border-violet-500/30 hover:text-violet-400",
  },
};

const PHASE_SHORT: Record<string, string> = {
  "In Possession": "In Possession",
  "Transition After Losing Possession": "Trans. Losing",
  "Out of Possession": "Out of Possession",
  "Transition After Winning Possession": "Trans. Winning",
  "Set Pieces": "Set Pieces",
};

const getMediaType = (url?: string) => {
  if (!url) return null;
  const normalized = url.toLowerCase();
  const cleanUrl = normalized.split('#')[0].split('?')[0];

  if (normalized.startsWith('data:image') || cleanUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return 'image';
  if (normalized.startsWith('data:video') || cleanUrl.match(/\.(mp4|webm|ogg|ogv|mov|m4v|mkv)$/i)) return 'video';
  if (normalized.startsWith('data:application/pdf') || cleanUrl.endsWith('.pdf')) return 'pdf';
  if (url.startsWith('/static/')) {
    const ext = cleanUrl.split('.').pop()?.toLowerCase();
    if (['jpg','jpeg','png','gif','webp'].includes(ext||'')) return 'image';
    if (['mp4','webm','ogg','ogv','mov','m4v','mkv'].includes(ext||'')) return 'video';
    if (ext === 'pdf') return 'pdf';
  }
  return 'unknown';
};

export default function PrinciplesLibrary() {
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhase, setActivePhase] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [viewMedia, setViewMedia] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', gamePhase: 'In Possession', description: '', coachingNotes: '', implementationTips: '', mediaUrl: '' });

  // --- Load Data ---
  useEffect(() => {
    fetch('http://127.0.0.1:8000/principles')
        .then(res => res.json())
        .then(data => {
            const dbItems: Principle[] = data.map(mapPrincipleFromApi);
            setPrinciples(dbItems);
            if (dbItems.length > 0) setSelectedId(dbItems[0].id);
        })
        .catch(() => toast.error('Backend offline'));
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.description) return toast.error('Fill required fields');

    const principleToSave: Principle = {
      id: formData.id,
      name: formData.name,
      gamePhase: formData.gamePhase,
      description: formData.description,
      coachingNotes: formData.coachingNotes,
      implementationTips: formData.implementationTips,
      mediaUrl: mediaPreview || formData.mediaUrl,
      isCustom: true
    };

    const payload = mapPrincipleToApi(principleToSave);

    try {
      const url = isEditing ? `http://127.0.0.1:8000/principles/${formData.id}` : 'http://127.0.0.1:8000/principles';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const saved = await res.json();
        const newItem = mapPrincipleFromApi(saved);
        if (isEditing) {
          setPrinciples(prev => prev.map(p => p.id === newItem.id ? newItem : p));
        } else {
          setPrinciples(prev => [...prev, newItem]);
          setSelectedId(newItem.id);
        }
        toast.success(isEditing ? 'Updated!' : 'Created!');
        closeModal();
      }
    } catch { toast.error('Connection failed'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/principles/${id}`, { method: 'DELETE' });
      setPrinciples(prev => {
        const next = prev.filter(p => p.id !== id);
        if (selectedId === id) setSelectedId(next[0]?.id ?? null);
        return next;
      });
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isVideo && !isPdf) {
      toast.error('Unsupported media type. Please upload an image, video, or PDF.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) return toast.error('File too large. Max 100MB.');
    if (isImage) setMediaPreview(URL.createObjectURL(file));
    try {
      const url = await uploadFile(file);
      setMediaPreview(url);
    } catch { toast.error('Upload failed'); setMediaPreview(null); }
  };

  const closeModal = () => {
    setShowCreateModal(false); setIsEditing(false); setMediaPreview(null);
    setFormData({ id: '', name: '', gamePhase: 'In Possession', description: '', coachingNotes: '', implementationTips: '', mediaUrl: '' });
  };

  const openEdit = (p: Principle) => {
    setFormData({ id: p.id, name: p.name, gamePhase: p.gamePhase, description: p.description, coachingNotes: p.coachingNotes || '', implementationTips: p.implementationTips || '', mediaUrl: p.mediaUrl || '' });
    setMediaPreview(p.mediaUrl || null);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  // --- Derived data ---
  const phaseCounts = GAME_PHASES.reduce<Record<string, number>>((acc, ph) => {
    acc[ph] = principles.filter(p => p.gamePhase === ph).length;
    return acc;
  }, {});

  const filtered = principles.filter(p => {
    const matchPhase = activePhase === 'All' || p.gamePhase === activePhase;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPhase && matchSearch;
  });

  const selected = principles.find(p => p.id === selectedId) ?? filtered[0] ?? null;
  const colors = selected ? PHASE_COLORS[selected.gamePhase] : null;
  const activePhasesCount = GAME_PHASES.filter(ph => phaseCounts[ph] > 0).length;

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full bg-purple-500 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Principles Library</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {principles.length} {principles.length === 1 ? 'principle' : 'principles'}
              {activePhasesCount > 0 && <> &middot; {activePhasesCount} phase{activePhasesCount > 1 ? 's' : ''}</>}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={<Plus size={18} />}>Add Principle</Button>
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActivePhase('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            activePhase === 'All'
              ? 'bg-white/10 border-white/30 text-white'
              : 'bg-transparent border-white/10 text-slate-500 hover:text-white hover:border-white/20'
          }`}
        >
          All <span className="ml-1 opacity-60">{principles.length}</span>
        </button>
        {GAME_PHASES.map(phase => {
          const c = PHASE_COLORS[phase];
          const count = phaseCounts[phase];
          const isActive = activePhase === phase;
          return (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                isActive ? c.tabActive : `bg-transparent border-white/10 text-slate-500 ${c.tabHover}`
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${isActive ? '' : 'opacity-40 group-hover:opacity-70'}`} />
                {PHASE_SHORT[phase]}
                <span className="opacity-60">{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Master / Detail */}
      <div className="grid grid-cols-12 gap-6" style={{ minHeight: '640px' }}>

        {/* LEFT: List */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search principles..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-white/5 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:bg-slate-900 transition-colors"
            />
          </div>

          <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1" style={{ maxHeight: '620px' }}>
            <AnimatePresence>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-600">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No principles found</p>
                </div>
              )}
              {filtered.map(p => {
                const c = PHASE_COLORS[p.gamePhase];
                const isSelected = selectedId === p.id;
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    onClick={() => setSelectedId(p.id)}
                    className={`group relative rounded-xl border cursor-pointer transition-all p-4 ${
                      isSelected
                        ? `${c.bg} ${c.border}`
                        : 'bg-slate-900/40 border-white/5 hover:border-white/15 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${c.dot} ${isSelected ? 'opacity-100' : 'opacity-20 group-hover:opacity-50'} transition-opacity`} />
                    <div className="pl-3 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>{p.name}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 inline-block ${c.text}`}>{PHASE_SHORT[p.gamePhase]}</span>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isSelected && <ChevronRight size={14} className={`${c.text} mt-0.5`} />}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(p); }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-colors"
                          ><Edit2 size={11} /></button>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 border border-white/5 transition-colors"
                          ><Trash2 size={11} /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Detail Panel */}
        <div className="col-span-12 lg:col-span-8">
          {selected && colors ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`h-full rounded-2xl border bg-slate-900/40 overflow-y-auto custom-scrollbar ${colors.border}`}
              style={{ maxHeight: '672px' }}
            >
              {/* Detail Header */}
              <div className={`p-6 border-b ${colors.border} ${colors.bg}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border mb-3 ${colors.badgeBg} ${colors.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {selected.gamePhase}
                    </span>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{selected.name}</h2>
                  </div>
                  {selected.isCustom && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(selected)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-colors"
                      ><Edit2 size={12} /> Edit</button>
                      <button
                        onClick={() => setConfirmDeleteId(selected.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 text-xs font-bold border border-white/10 transition-colors"
                      ><Trash2 size={12} /> Delete</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Description</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{selected.description}</p>
                </div>

                {selected.coachingNotes && (
                  <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4">
                    <h4 className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Coaching Notes
                    </h4>
                    <p className="text-yellow-100/80 text-sm leading-relaxed">{selected.coachingNotes}</p>
                  </div>
                )}

                {selected.implementationTips && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Key Implementation Points</h4>
                    <ul className="space-y-2.5">
                      {selected.implementationTips.split('\n').filter(t => t.trim()).map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${colors.dot} ${colors.glow}`} />
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.mediaUrl && (() => {
                  const type = getMediaType(selected.mediaUrl);
                  if (type === 'image') return (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Media</h4>
                      <img src={selected.mediaUrl} alt="Media" className="w-full max-h-72 object-cover rounded-xl border border-white/10 cursor-zoom-in hover:opacity-90 transition-opacity" onClick={() => setViewMedia(selected.mediaUrl!)} />
                    </div>
                  );
                  if (type === 'video') return (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Media</h4>
                      <div className="w-full h-40 bg-black rounded-xl border border-white/10 flex items-center justify-center group cursor-pointer hover:border-white/20 transition-colors" onClick={() => setViewMedia(selected.mediaUrl!)}>
                        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-white transition-colors"><VideoIcon size={32} /><span className="text-xs font-bold uppercase tracking-widest">Play Video</span></div>
                      </div>
                    </div>
                  );
                  if (type === 'pdf') return (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Media</h4>
                      <div className="w-full h-40 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center group cursor-pointer hover:border-white/20 transition-colors" onClick={() => setViewMedia(selected.mediaUrl!)}>
                        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-white transition-colors"><FileText size={32} /><span className="text-xs font-bold uppercase tracking-widest">Open PDF</span></div>
                      </div>
                    </div>
                  );
                  return null;
                })()}
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] rounded-2xl border border-white/5 bg-slate-900/20 flex flex-col items-center justify-center text-slate-600">
              <BookOpen size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">Select a principle to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreateModal} onClose={closeModal}
        title={isEditing ? 'Edit Principle' : 'New Principle'}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20">Save</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. High Press" />
          <Select label="Phase" value={formData.gamePhase} onChange={val => setFormData({ ...formData, gamePhase: val as string })} options={GAME_PHASES.map(p => ({ label: p, value: p }))} />
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Media</label>
            <div className="h-28 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl relative group hover:border-purple-500/30 transition-colors flex items-center justify-center overflow-hidden cursor-pointer">
              {mediaPreview ? (
                <>
                  {getMediaType(mediaPreview) === 'image' && <img src={mediaPreview} className="w-full h-full object-cover" />}
                  {getMediaType(mediaPreview) === 'video' && <div className="text-purple-400 flex flex-col items-center gap-1"><VideoIcon size={28} /><span className="text-xs font-bold">Video Selected</span></div>}
                  {getMediaType(mediaPreview) === 'pdf' && <div className="text-purple-400 flex flex-col items-center gap-1"><FileText size={28} /><span className="text-xs font-bold">PDF Selected</span></div>}
                  <button onClick={e => { e.stopPropagation(); setMediaPreview(null); setFormData({ ...formData, mediaUrl: '' }); }} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"><X size={14} /></button>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-purple-400 transition-colors gap-1">
                  <Upload size={22} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Upload File</span>
                  <input type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={handleFileUpload} />
                </label>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 resize-none h-24 custom-scrollbar transition-colors" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the principle..." />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-yellow-500/80 uppercase tracking-widest ml-1">Coaching Notes</label>
            <textarea className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none placeholder:text-slate-600 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 resize-none h-20 custom-scrollbar transition-colors" value={formData.coachingNotes} onChange={e => setFormData({ ...formData, coachingNotes: e.target.value })} placeholder="Key coaching details..." />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Implementation Tips <span className="normal-case text-slate-600 font-normal">(one per line)</span></label>
            <textarea className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 resize-none h-24 custom-scrollbar transition-colors" value={formData.implementationTips} onChange={e => setFormData({ ...formData, implementationTips: e.target.value })} placeholder={"Trigger press on back pass\nSecond striker supports"} />
          </div>
        </div>
      </Modal>

      {/* Lightbox */}
      <AnimatePresence>
        {viewMedia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewMedia(null)}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              {getMediaType(viewMedia) === 'image' && <img src={viewMedia} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10" />}
              {getMediaType(viewMedia) === 'video' && <video src={viewMedia} controls autoPlay className="max-w-full max-h-[90vh] rounded-xl shadow-2xl border border-white/10" />}
              {getMediaType(viewMedia) === 'pdf' && <iframe src={viewMedia} title="PDF" className="w-[80vw] h-[85vh] rounded-xl bg-white shadow-2xl" />}
              <button onClick={() => setViewMedia(null)} className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors border border-white/10"><X size={22} /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Delete principle?"
        message="This will permanently remove this principle from the library."
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}