import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";

interface Basic {
  id: string;
  name: string;
  description: string;
  diagramUrl?: string; 
  isCustom: boolean;
}

const mockBasics: Basic[] = [
  { id: 'b1', name: 'Passing Accuracy', description: 'Techniques for short and long range passing.', isCustom: false },
];

export default function BasicsLibrary() {
  const [basics, setBasics] = useState<Basic[]>(mockBasics);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ id: '', name: '', description: '', diagramUrl: '' });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/basics')
      .then(res => res.json())
      .then(data => {
        const dbItems = data.map((item: any) => ({ 
            id: item.id, name: item.name, description: item.description,
            diagramUrl: item.diagram_url, isCustom: true 
        }));
        setBasics([...mockBasics, ...dbItems]);
      })
      .catch(() => toast.error("Backend offline - Showing mocks"));
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.description) return toast.error('Fill required fields');

    const payload = {
        name: formData.name, description: formData.description,
        diagram_url: mediaPreview || formData.diagramUrl 
    };

    try {
      let response;
      if (isEditing && formData.id && !formData.id.startsWith('b')) {
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
    if (id.startsWith('b')) { setBasics(prev => prev.filter(b => b.id !== id)); return; }
    await fetch(`http://127.0.0.1:8000/basics/${id}`, { method: 'DELETE' });
    setBasics(prev => prev.filter(b => b.id !== id));
    toast.success('Deleted');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header with tighter tracking */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Basics Library</h1>
          <p className="text-slate-400 mt-1 font-medium">Fundamental technical concepts</p>
        </div>
        <Button onClick={() => { closeModal(); setShowCreateModal(true); }} icon={<Plus size={18} />}>
          Create Basic
        </Button>
      </div>

      {/* Search - Fixed Padding Issue */}
      <Card className="p-2 px-4">
        <Input 
            icon={<Search size={18} />} 
            placeholder="Search basics..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="border-0 bg-transparent focus:ring-0"
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
        {filteredBasics.map((basic, idx) => (
          <Card 
            key={basic.id} 
            animate 
            delay={idx * 0.05}
            className="p-5 hover:border-blue-500/50 group flex flex-col h-full transition-colors"
          >
            <div className="bg-slate-950/50 rounded-xl h-40 mb-5 flex flex-col items-center justify-center border border-slate-800 text-slate-600 relative overflow-hidden shrink-0 group-hover:border-blue-500/20 transition-colors">
                {basic.diagramUrl ? (
                    <img src={basic.diagramUrl} alt="Diagram" className="w-full h-full object-contain p-2" />
                ) : (
                    <>
                        <ImageIcon size={24} className="mb-3 opacity-30 group-hover:text-blue-500 group-hover:opacity-100 transition-all" />
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-80 transition-opacity">Diagram Missing</span>
                    </>
                )}
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{basic.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{basic.description}</p>
            </div>
            
            {basic.isCustom && (
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" onClick={(e) => { e.stopPropagation(); openEdit(basic); }} className="p-2 h-8 w-8"><Edit2 size={14} /></Button>
                    <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(basic.id); }} className="p-2 h-8 w-8"><Trash2 size={14} /></Button>
                </div>
            )}
          </Card>
        ))}
        </AnimatePresence>
      </div>

      <Modal 
        isOpen={showCreateModal} 
        onClose={closeModal}
        title={isEditing ? 'Edit Basic' : 'Create Basic'}
        footer={
            <div className="flex gap-3">
                <Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
                <Button onClick={handleSave} className="flex-1">Save</Button>
            </div>
        }
      >
        <div className="space-y-6">
            <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ball Control" />
            
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                    className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3.5 text-sm outline-none transition-all placeholder:text-slate-600 focus:bg-slate-900 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/10 resize-none h-32 custom-scrollbar"
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Describe the concept..." 
                />
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Media / Diagram</label>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-sm text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors w-full justify-center group">
                        <Upload size={16} className="group-hover:text-blue-400 transition-colors"/> 
                        <span className="font-medium">Upload Image/Video</span>
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                    </label>
                </div>
                {mediaPreview && (
                    <div className="mt-2 h-40 bg-slate-950 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center relative group">
                        <img src={mediaPreview} alt="Preview" className="h-full object-contain" />
                        <button onClick={() => setMediaPreview(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"><Trash2 size={12}/></button>
                    </div>
                )}
            </div>
        </div>
      </Modal>
    </div>
  );
}