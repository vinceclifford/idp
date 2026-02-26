import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, Upload, X, Video as VideoIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadFile } from '../lib/uploadFile';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { ConfirmDialog } from "./ui/ConfirmDialog";

interface Basic {
  id: string;
  name: string;
  description: string;
  diagramUrl?: string;
  isCustom: boolean;
}

// --- Helper ---
const getMediaType = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('data:image')) return 'image';
  if (url.startsWith('data:video')) return 'video';
  if (url.startsWith('data:application/pdf')) return 'pdf';
  // Fallback for actual URLs if needed
  if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) return 'image';
  if (url.match(/\.(mp4|webm)$/) != null) return 'video';
  return 'unknown';
};

export default function BasicsLibrary() {
  const [basics, setBasics] = useState<Basic[]>([]); // Initialize empty (No Mock Data)
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // State for Full Screen Media Viewer
  const [viewMedia, setViewMedia] = useState<string | null>(null);

  const [formData, setFormData] = useState({ id: '', name: '', description: '', diagramUrl: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // --- Load Data ---
  useEffect(() => {
    fetch('http://127.0.0.1:8000/basics')
      .then(res => res.json())
      .then(data => {
        const dbItems = data.map((item: any) => ({
          id: item.id, name: item.name, description: item.description,
          diagramUrl: item.diagram_url, isCustom: true
        }));
        setBasics(dbItems); // Set only fetched data
      })
      .catch(() => toast.error("Backend offline"));
  }, []);

  // --- Handlers ---
  const handleSave = async () => {
    if (!formData.name || !formData.description) return toast.error('Fill required fields');

    const payload = {
      name: formData.name,
      description: formData.description,
      diagram_url: mediaPreview || formData.diagramUrl
    };

    try {
      let response;
      if (isEditing && formData.id) {
        response = await fetch(`http://127.0.0.1:8000/basics/${formData.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        response = await fetch('http://127.0.0.1:8000/basics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }

      if (response.ok) {
        const saved = await response.json();
        const newItem = { id: saved.id, name: saved.name, description: saved.description, diagramUrl: saved.diagram_url, isCustom: true };

        if (isEditing) {
          setBasics(prev => prev.map(b => b.id === newItem.id ? newItem : b));
          toast.success('Updated successfully!');
        } else {
          setBasics(prev => [...prev, newItem]);
          toast.success('Created successfully!');
        }
        closeModal();
      } else { toast.error('Server Error'); }
    } catch { toast.error('Connection failed'); }
  };

  const handleDelete = async (id: string) => {
    try {
        await fetch(`http://127.0.0.1:8000/basics/${id}`, { method: 'DELETE' });
        setBasics(prev => prev.filter(b => b.id !== id));
        toast.success('Deleted');
    } catch {
        toast.error("Failed to delete");
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
    setShowCreateModal(false); setIsEditing(false); setMediaPreview(null);
    setFormData({ id: '', name: '', description: '', diagramUrl: '' });
  };

  const openEdit = (basic: Basic) => {
    setFormData({ id: basic.id, name: basic.name, description: basic.description, diagramUrl: basic.diagramUrl || '' });
    setMediaPreview(basic.diagramUrl || null); setIsEditing(true); setShowCreateModal(true);
  };

  const filteredBasics = basics.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Helper to render media in grid
  const renderCardMedia = (url: string) => {
    const type = getMediaType(url);
    if (type === 'image') return <img src={url} alt="Diagram" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />;
    if (type === 'video') return <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-blue-400 transition-colors"><VideoIcon size={32} /><span className="text-[10px] font-bold uppercase tracking-widest">Video</span></div>;
    if (type === 'pdf') return <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-blue-400 transition-colors"><FileText size={32} /><span className="text-[10px] font-bold uppercase tracking-widest">PDF</span></div>;
    return <ImageIcon size={24} className="text-slate-600" />;
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full bg-sky-500 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Basics Library</h1>
            <p className="text-sm text-slate-400 mt-0.5">Fundamental technical concepts</p>
          </div>
        </div>
        <Button onClick={() => { closeModal(); setShowCreateModal(true); }} icon={<Plus size={18} />}>
          Create Basic
        </Button>
      </div>

      {/* Search */}
      <Card className="p-2 px-4">
        <Input icon={<Search size={18} />} placeholder="Search basics..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border-0 bg-transparent focus:ring-0" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredBasics.map((basic, idx) => (
            <Card key={basic.id} animate delay={idx * 0.05} className="p-5 hover:border-blue-500/50 group flex flex-col h-full transition-colors">
              <div
                className={`bg-slate-950/50 rounded-xl h-40 mb-5 flex flex-col items-center justify-center border border-slate-800 text-slate-600 relative overflow-hidden shrink-0 group-hover:border-blue-500/20 transition-colors ${basic.diagramUrl ? 'cursor-zoom-in' : ''}`}
                onClick={(e) => {
                  if (basic.diagramUrl) {
                    e.stopPropagation();
                    setViewMedia(basic.diagramUrl);
                  }
                }}
              >
                {basic.diagramUrl ? renderCardMedia(basic.diagramUrl) : (
                  <>
                    <ImageIcon size={24} className="mb-3 opacity-30 group-hover:text-blue-500 group-hover:opacity-100 transition-all" />
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-80 transition-opacity">Diagram Missing</span>
                  </>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{basic.name}</h3>
                <p className={`text-slate-400 text-sm leading-relaxed transition-all ${!expandedIds.has(basic.id) ? 'line-clamp-3' : ''}`}>{basic.description}</p>
                {basic.description?.length > 120 && (
                  <button onClick={e => { e.stopPropagation(); toggleExpanded(basic.id); }} className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 mt-1.5 transition-colors">
                    {expandedIds.has(basic.id) ? 'Show less ↑' : 'Read more ↓'}
                  </button>
                )}
              </div>

              {basic.isCustom && (
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" onClick={(e) => { e.stopPropagation(); openEdit(basic); }} className="p-2 h-8 w-8"><Edit2 size={14} /></Button>
                  <Button variant="danger" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(basic.id); }} className="p-2 h-8 w-8"><Trash2 size={14} /></Button>
                </div>
              )}
            </Card>
          ))}
        </AnimatePresence>
        {filteredBasics.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 italic">
                No basics found. Create one to get started.
            </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={closeModal} title={isEditing ? 'Edit Basic' : 'Create Basic'}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">Save</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ball Control" />

          {/* Visual Media Upload */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Media (Image, Video, PDF)</label>
            <div className="h-32 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl relative group hover:border-blue-500/30 transition-colors flex flex-col items-center justify-center text-slate-500 overflow-hidden cursor-pointer">
              {mediaPreview ? (
                <>
                  {getMediaType(mediaPreview) === 'image' && <img src={mediaPreview} className="w-full h-full object-cover" />}
                  {getMediaType(mediaPreview) === 'video' && <div className="text-blue-400 flex flex-col items-center"><VideoIcon size={32} /><span className="text-xs mt-2 font-bold">Video Selected</span></div>}
                  {getMediaType(mediaPreview) === 'pdf' && <div className="text-blue-400 flex flex-col items-center"><FileText size={32} /><span className="text-xs mt-2 font-bold">PDF Selected</span></div>}

                  <button
                    onClick={(e) => { e.stopPropagation(); setMediaPreview(null); setFormData({ ...formData, diagramUrl: '' }); }}
                    className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:text-blue-400 transition-colors">
                  <Upload size={24} className="mb-2" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Upload File</span>
                  <input type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={handleFileUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea
              className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none transition-all placeholder:text-slate-600 focus:bg-slate-900 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/10 resize-none h-32 custom-scrollbar"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the concept..."
            />
          </div>
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

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Delete item?"
        message="This will permanently remove this entry from the library."
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}