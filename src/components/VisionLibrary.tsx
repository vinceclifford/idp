import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Eye, Download, History, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

// --- Services ---
import { apiClient } from '../services/api-client';
import { uploadFile } from '../lib/uploadFile';

interface Vision {
    id: string;
    title: string;
    filename: string;
    uploaded_at: string;
}

export default function VisionLibrary() {
    const [visions, setVisions] = useState<Vision[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingVision, setViewingVision] = useState<Vision | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Filter sessions or just use the log
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchVisions();
    }, []);

    const fetchVisions = async () => {
        try {
            const data = await apiClient.get<Vision[]>('/visions');
            setVisions(data);
        } catch (err) {
            toast.error("Failed to load vision log");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !newTitle) return;

        setUploading(true);
        try {
            // 1. Upload the file to static storage
            const url = await uploadFile(selectedFile);
            const filename = url.split('/').pop() || '';

            // 2. Create the Vision record
            await apiClient.post('/visions', {
                title: newTitle,
                filename: filename
            });

            toast.success("Vision uploaded successfully");
            setShowUploadModal(false);
            setNewTitle('');
            setSelectedFile(null);
            fetchVisions();
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this version?")) return;
        try {
            await apiClient.delete(`/visions/${id}`);
            toast.success("Version deleted");
            fetchVisions();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const activeVision = visions[0]; // Latest one is active
    const historyVisions = visions.slice(1);

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Coaching Vision</h1>
                    <p className="text-slate-400">Manage and present your team's tactical philosophy and long-term goals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowHistory(!showHistory)}
                        icon={<History size={18} />}
                    >
                        {showHistory ? "Hide History" : "View History"}
                    </Button>
                    <Button 
                        onClick={() => setShowUploadModal(true)}
                        icon={<Plus size={18} />}
                    >
                        New Version
                    </Button>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${showHistory ? 'lg:grid-cols-3' : ''} gap-8`}>
                {/* Main: Current Vision */}
                <div className={`${showHistory ? 'lg:col-span-2' : ''} space-y-6`}>
                    {activeVision ? (
                        <Card className="overflow-hidden border-blue-500/20 bg-blue-500/[0.02]">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">{activeVision.title}</h2>
                                        <p className="text-sm text-slate-500">
                                            Active since {new Date(activeVision.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button 
                                        variant="primary" 
                                        onClick={() => setViewingVision(activeVision)}
                                        icon={<Eye size={16} />}
                                    >
                                        Present
                                    </Button>
                                    <a 
                                        href={`/static/uploads/${activeVision.filename}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                                    >
                                        <Download size={18} />
                                    </a>
                                </div>
                            </div>
                            
                            {/* Preview Window (Compact) */}
                            <div className="aspect-[16/9] bg-slate-900/50 relative group">
                                <iframe 
                                    src={`/static/uploads/${activeVision.filename}#toolbar=0`}
                                    className="w-full h-full border-none pointer-events-none opacity-60"
                                    title="Active Vision Preview"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="secondary"
                                        onClick={() => setViewingVision(activeVision)}
                                        icon={<Maximize2 size={18} />}
                                    >
                                        Click to Present
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed border-white/10">
                            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600 mb-6">
                                <FileText size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Vision Found</h3>
                            <p className="text-slate-500 max-w-xs mb-8">Upload your tactical vision PDF to share it with your staff and present it in meetings.</p>
                            <Button onClick={() => setShowUploadModal(true)}>Upload Your First Vision</Button>
                        </Card>
                    )}
                </div>

                {/* Sidebar: History/Log */}
                {showHistory && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 px-1">
                        <History size={18} className="text-slate-500" />
                        Vision Archive
                    </h3>
                    
                    <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {visions.length > 0 ? visions.map((v, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={v.id}
                            >
                                <Card 
                                    className={`p-4 border-white/5 hover:border-white/10 transition-all cursor-pointer group ${idx === 0 ? 'bg-blue-500/5' : 'bg-white/[0.02]'}`}
                                    onClick={() => setViewingVision(v)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-500'}`}>
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{v.title}</h4>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {new Date(v.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {idx !== 0 && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-500/10 hover:text-rose-400 text-slate-600 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        )) : (
                            <p className="text-sm text-slate-600 text-center py-8">Log is empty</p>
                        )}
                    </div>
                </div>
                )}
            </div>

            {/* Upload Modal */}
            <Modal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                title="Upload New Vision"
                icon={<Upload className="text-blue-400" />}
            >
                <form onSubmit={handleFileUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Version Title</label>
                        <input
                            type="text"
                            placeholder="e.g., Pre-Season Vision 2024"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div 
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all
                            ${selectedFile ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-blue-500/30 bg-white/[0.02]'}`}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            id="pdf-upload"
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 
                                ${selectedFile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                <Upload size={24} />
                            </div>
                            <span className="text-sm font-medium text-white mb-1">
                                {selectedFile ? selectedFile.name : "Choose PDF Vision"}
                            </span>
                            <span className="text-xs text-slate-500">Only .pdf files supported</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button 
                            className="flex-1" 
                            variant="primary" 
                            type="submit" 
                            disabled={uploading || !selectedFile || !newTitle}
                            isLoading={uploading}
                        >
                            Upload & Set as Active
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowUploadModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Presentation Modal (Full Page Preview) */}
            <Modal
                isOpen={!!viewingVision}
                onClose={() => setViewingVision(null)}
                title={viewingVision?.title || "Vision Presenter"}
                maxWidth="6xl"
            >
                {viewingVision && (
                    <div className="flex flex-col h-[80vh]">
                        <iframe 
                            src={`/static/uploads/${viewingVision.filename}`}
                            className="w-full flex-1 rounded-xl border border-white/5 bg-slate-900"
                            title="Vision Viewer"
                        />
                        <div className="mt-6 flex justify-between items-center px-2">
                             <div className="text-slate-500 text-xs">
                                Uploaded on {new Date(viewingVision.uploaded_at).toLocaleString()}
                            </div>
                            <Button variant="secondary" onClick={() => setViewingVision(null)}>Close Presenter</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

// Missing Lucide icons
function Maximize2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}
