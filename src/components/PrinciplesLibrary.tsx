import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Upload, Image as ImageIcon, Video as VideoIcon, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadFile } from '../lib/uploadFile';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Modal } from "./ui/Modal";

interface Principle {
  id: string; name: string; gamePhase: string; description: string;
  coachingNotes?: string; implementationTips?: string; mediaUrl?: string; isCustom: boolean;
}

const GAME_PHASES = ["In Possession", "Transition After Losing Possession", "Out of Possession", "Transition After Winning Possession", "Set Pieces"];

// --- Helper ---
const getMediaType = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('data:image')) return 'image';
    if (url.startsWith('data:video')) return 'video';
    if (url.startsWith('data:application/pdf')) return 'pdf';
    // Fallback for actual URLs if you switch to cloud storage later
    if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) return 'image';
    if (url.match(/\.(mp4|webm)$/) != null) return 'video';
    return 'unknown';
};

export default function PrinciplesLibrary() {
  const [principles, setPrinciples] = useState<Principle[]>([]); // Initialized empty
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  // New State for Lightbox
  const [viewMedia, setViewMedia] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ id: '', name: '', gamePhase: 'In Possession', description: '', coachingNotes: '', implementationTips: '', mediaUrl: '' });

  // --- Load Data ---
  useEffect(() => {
    fetch('http://127.0.0.1:8000/principles')
        .then(res => res.json())
        .then(data => {
            const dbItems = data.map((item: any) => ({ 
                id: item.id, 
                name: item.name, 
                gamePhase: item.game_phase, 
                description: item.description, 
                coachingNotes: item.coaching_notes || '', 
                implementationTips: item.implementation_tips || '', 
                mediaUrl: item.media_url, 
                isCustom: true 
            }));
            setPrinciples(dbItems); // Set only DB items
        })
        .catch(() => toast.error("Backend offline"));
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.description) return toast.error('Fill required fields');
    
    const payload = { 
        name: formData.name, 
        game_phase: formData.gamePhase, 
        description: formData.description, 
        coaching_notes: formData.coachingNotes, 
        implementation_tips: formData.implementationTips, 
        media_url: mediaPreview || formData.mediaUrl 
    };

    try {
      let response;
      // Check if it's an existing ID (from DB)
      if (isEditing && formData.id) {
        response = await fetch(`http://127.0.0.1:8000/principles/${formData.id}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
      } else {
        response = await fetch('http://127.0.0.1:8000/principles', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
      }

      if (response.ok) {
        const saved = await response.json();
        const newItem = { 
            id: saved.id, 
            name: saved.name, 
            gamePhase: saved.game_phase, 
            description: saved.description, 
            coachingNotes: saved.coaching_notes, 
            implementationTips: saved.implementation_tips, 
            mediaUrl: saved.media_url, 
            isCustom: true 
        };
        
        if (isEditing) {
            setPrinciples(prev => prev.map(p => p.id === newItem.id ? newItem : p));
        } else {
            setPrinciples(prev => [...prev, newItem]);
        }
        
        toast.success(isEditing ? 'Updated successfully!' : 'Created successfully!');
        closeModal();
      }
    } catch { toast.error('Connection failed'); }
  };

  const handleDelete = async (id: string) => {
    try {
        await fetch(`http://127.0.0.1:8000/principles/${id}`, { method: 'DELETE' });
        setPrinciples(prev => prev.filter(p => p.id !== id));
        toast.success('Deleted');
    } catch {
        toast.error('Failed to delete');
    }
  };

  // --- File Upload Logic ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) return toast.error("File too large. Max 100MB allowed.");
    if (file.type.startsWith('image/')) {
      setMediaPreview(URL.createObjectURL(file));
    }
    try {
      const url = await uploadFile(file);
      setMediaPreview(url);
    } catch {
      toast.error('File upload failed. Please try again.');
      setMediaPreview(null);
    }
  };

  const closeModal = () => { 
      setShowCreateModal(false); 
      setIsEditing(false); 
      setMediaPreview(null); 
      setFormData({ id: '', name: '', gamePhase: 'In Possession', description: '', coachingNotes: '', implementationTips: '', mediaUrl: '' }); 
  };
  
  const openEdit = (p: Principle) => { 
      setFormData({ 
          id: p.id, 
          name: p.name, 
          gamePhase: p.gamePhase, 
          description: p.description, 
          coachingNotes: p.coachingNotes || '', 
          implementationTips: p.implementationTips || '', 
          mediaUrl: p.mediaUrl || '' 
      }); 
      setMediaPreview(p.mediaUrl || null); 
      setIsEditing(true); 
      setShowCreateModal(true); 
  };
  
  const filteredPrinciples = principles.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- Media Renderer ---
  const renderCardMedia = (url: string) => {
      const type = getMediaType(url);
      
      if (type === 'image') return <img src={url} alt="Media" className="w-full h-40 object-cover rounded-lg mt-4 border border-white/5 opacity-80 hover:opacity-100 transition-opacity cursor-zoom-in" onClick={(e) => {e.stopPropagation(); setViewMedia(url)}} />;
      
      if (type === 'video') return (
        <div className="w-full h-40 mt-4 bg-black rounded-lg border border-white/5 flex items-center justify-center group cursor-zoom-in" onClick={(e) => {e.stopPropagation(); setViewMedia(url)}}>
            <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-purple-400 transition-colors">
                <VideoIcon size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Video</span>
            </div>
        </div>
      );

      if (type === 'pdf') return (
        <div className="w-full h-40 mt-4 bg-slate-900 rounded-lg border border-white/5 flex items-center justify-center group cursor-zoom-in" onClick={(e) => {e.stopPropagation(); setViewMedia(url)}}>
            <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-purple-400 transition-colors">
                <FileText size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest">PDF Document</span>
            </div>
        </div>
      );
      
      return null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white tracking-tight">Principles Library</h1><p className="text-slate-400 mt-1 font-medium">Tactical philosophy</p></div>
        <Button onClick={() => setShowCreateModal(true)} icon={<Plus size={18}/>}>Create Principle</Button>
      </div>

      <Card className="p-2 px-4">
        <Input icon={<Search size={18} />} placeholder="Search principles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border-0 bg-transparent focus:ring-0" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
        {filteredPrinciples.map((p, idx) => (
            <Card key={p.id} animate delay={idx * 0.05} className="p-6 hover:border-purple-500/30 group flex flex-col shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{p.name}</h3>
                        <span className="text-[10px] uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-md font-bold inline-block shadow-sm shadow-purple-900/20">{p.gamePhase}</span>
                    </div>
                </div>

                <p className="text-slate-400 leading-relaxed text-sm mb-6">{p.description}</p>
                
                {/* Media Preview inside Card */}
                {p.mediaUrl && renderCardMedia(p.mediaUrl)}

                {p.coachingNotes && (
                    <div className="mt-6 mb-6 bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4">
                        <h4 className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Coaching Note
                        </h4>
                        <p className="text-yellow-100/80 text-xs leading-relaxed">{p.coachingNotes}</p>
                    </div>
                )}

                <div className="mt-auto space-y-4">
                    {p.implementationTips && (
                        <div className="border-t border-white/5 pt-4">
                            <h4 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3">Key Points</h4>
                            <ul className="space-y-2">
                                {p.implementationTips.split('\n').map((tip, i) => tip.trim() && (
                                    <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                        <span className="leading-relaxed text-xs">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {p.isCustom && (
                        <div className="pt-4 border-t border-white/5 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="secondary" onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="p-2 h-8 w-8"><Edit2 size={14} /></Button>
                             <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 h-8 w-8"><Trash2 size={14} /></Button>
                        </div>
                    )}
                </div>
            </Card>
        ))}
        </AnimatePresence>
        {filteredPrinciples.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 italic">
                No principles found. Create one to get started.
            </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={closeModal} title={isEditing ? 'Edit Principle' : 'New Principle'} 
        footer={<div className="flex gap-3"><Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button><Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20">Save</Button></div>}>
        <div className="space-y-6">
            <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. High Press" />
            <Select label="Phase" value={formData.gamePhase} onChange={val => setFormData({...formData, gamePhase: val as string})} options={GAME_PHASES.map(p => ({label: p, value: p}))} />
            
            {/* Visual Media Upload - Consistent Style */}
            <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Media</label>
                <div className="h-32 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl relative group hover:border-purple-500/30 transition-colors flex flex-col items-center justify-center text-slate-500 overflow-hidden cursor-pointer">
                    {mediaPreview ? (
                        <>
                            {getMediaType(mediaPreview) === 'image' && <img src={mediaPreview} className="w-full h-full object-cover" />}
                            {getMediaType(mediaPreview) === 'video' && <div className="text-purple-400 flex flex-col items-center"><VideoIcon size={32} /><span className="text-xs mt-2 font-bold">Video Selected</span></div>}
                            {getMediaType(mediaPreview) === 'pdf' && <div className="text-purple-400 flex flex-col items-center"><FileText size={32} /><span className="text-xs mt-2 font-bold">PDF Selected</span></div>}
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); setMediaPreview(null); setFormData({ ...formData, mediaUrl: '' });}} 
                                className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X size={14}/>
                            </button>
                        </>
                    ) : (
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:text-purple-400 transition-colors">
                            <Upload size={24} className="mb-2" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Upload File</span>
                            <input type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={handleFileUpload} />
                        </label>
                    )}
                </div>
            </div>

            <div className="space-y-2"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none placeholder:text-slate-600 focus:bg-slate-900 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 hover:border-white/10 resize-none h-24 custom-scrollbar" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            
            <div className="space-y-2"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-yellow-500/80">Coaching Notes</label>
            <textarea className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none placeholder:text-slate-600 focus:bg-slate-900 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 hover:border-white/10 resize-none h-20 custom-scrollbar" value={formData.coachingNotes} onChange={e => setFormData({...formData, coachingNotes: e.target.value})} placeholder="Key details..." /></div>
            
            <div className="space-y-2"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Implementation Tips (Line Separated)</label>
            <textarea className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none placeholder:text-slate-600 focus:bg-slate-900 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/10 resize-none h-24 custom-scrollbar" value={formData.implementationTips} onChange={e => setFormData({...formData, implementationTips: e.target.value})} /></div>
        </div>
      </Modal>

      {/* Lightbox Viewer */}
      <AnimatePresence>
        {viewMedia && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewMedia(null)}
                className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
            >
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="relative max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {getMediaType(viewMedia) === 'image' && (
                        <img src={viewMedia} alt="Full size media" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10" />
                    )}
                    {getMediaType(viewMedia) === 'video' && (
                        <video src={viewMedia} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/10" />
                    )}
                    {getMediaType(viewMedia) === 'pdf' && (
                        <iframe src={viewMedia} title="PDF Viewer" className="w-full h-full rounded-lg bg-white shadow-2xl border border-white/10" />
                    )}
                    
                    <button 
                        onClick={() => setViewMedia(null)}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors shadow-lg backdrop-blur-md border border-white/10"
                    >
                        <X size={24} />
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}