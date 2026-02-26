import { useState, useEffect } from 'react';
import { Plus, X, Search, Edit2, Trash2, Upload, Check, Image as ImageIcon, FileText, Video as VideoIcon, Play, ChevronDown, ChevronRight, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadFile } from '../lib/uploadFile';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Modal } from "./ui/Modal";

// --- Types ---
interface Exercise {
    id: string;
    name: string;
    intensity: 'Low' | 'Medium' | 'High';
    description: string;
    setup: string;
    variations: string;
    coachingPoints: string;
    goalkeepers: number;
    equipment: string[];
    linkedBasics: string[];
    linkedPrinciples: string[];
    linkedTactics: string[];
    mediaUrl?: string;
    isCustom: boolean;
}

interface SelectorItem { id: string; name: string; }

// --- Helpers ---
const getMediaType = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('data:image')) return 'image';
    if (url.startsWith('data:video')) return 'video';
    if (url.startsWith('data:application/pdf')) return 'pdf';
    if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) return 'image';
    if (url.match(/\.(mp4|webm)$/) != null) return 'video';
    return 'unknown';
};

const getIntensityStyles = (intensity: string) => {
    switch (intensity) {
        case 'Low': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
        case 'High': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
        default: return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    }
};

const equipmentOptions = ['Balls', 'Cones', 'Bibs/Vests', 'Goals', 'Hurdles', 'Poles', 'Agility Ladder', 'Markers', 'Mannequins', 'Mini Goals'];

export default function ExercisesLibrary() {
    const [exercises, setExercises] = useState<Exercise[]>([]); // Initialize empty (No Mock Data)
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    // Lightbox State
    const [viewMedia, setViewMedia] = useState<string | null>(null);

    // Accordion State
    const [openSection, setOpenSection] = useState<string | null>(null);

    // Selector Lists
    const [allBasics, setAllBasics] = useState<SelectorItem[]>([]);
    const [allPrinciples, setAllPrinciples] = useState<SelectorItem[]>([]);
    const [allTactics, setAllTactics] = useState<SelectorItem[]>([]);

    const [basicsSearch, setBasicsSearch] = useState('');
    const [principlesSearch, setPrinciplesSearch] = useState('');
    const [tacticsSearch, setTacticsSearch] = useState('');

    const [formData, setFormData] = useState<Exercise>({
        id: '', name: '', intensity: 'Medium', description: '', setup: '',
        variations: '', coachingPoints: '', goalkeepers: 0,
        equipment: [], linkedBasics: [], linkedPrinciples: [], linkedTactics: [], isCustom: true, mediaUrl: ''
    });

    // --- 1. LOAD DATA ---
    useEffect(() => {
        // Fetch Exercises
        fetch('http://127.0.0.1:8000/exercises')
            .then(res => res.json())
            .then(data => {
                const formatted = data.map((item: any) => ({
                    id: item.id, name: item.name, description: item.description, intensity: item.intensity,
                    setup: item.setup || '', variations: item.variations || '', coachingPoints: item.coaching_points || '',
                    goalkeepers: item.goalkeepers || 0,
                    equipment: item.equipment ? item.equipment.split(',') : [],
                    linkedBasics: item.linked_basics ? item.linked_basics.split(',') : [],
                    linkedPrinciples: item.linked_principles ? item.linked_principles.split(',') : [],
                    linkedTactics: item.linked_tactics ? item.linked_tactics.split(',') : [],
                    isCustom: true, mediaUrl: item.media_url
                }));
                setExercises(formatted); // Set fetched data
            })
            .catch(() => { toast.error("Backend offline"); });

        // Fetch Selectors (Basics, Principles, Tactics)
        const fetchSelectors = async () => {
            try {
                const [bRes, pRes, tRes] = await Promise.all([
                    fetch('http://127.0.0.1:8000/basics'),
                    fetch('http://127.0.0.1:8000/principles'),
                    fetch('http://127.0.0.1:8000/tactics')
                ]);
                if (bRes.ok) setAllBasics(await bRes.json());
                if (pRes.ok) setAllPrinciples(await pRes.json());
                if (tRes.ok) setAllTactics(await tRes.json());
            } catch (e) { console.error("Failed to load selector lists", e); }
        };
        fetchSelectors();
    }, []);

    // --- 2. SAVE DATA ---
    const handleSave = async () => {
        if (!formData.name || !formData.description) return toast.error('Name and Description are required');

        const payload = {
            name: formData.name, description: formData.description, intensity: formData.intensity,
            setup: formData.setup, variations: formData.variations, coaching_points: formData.coachingPoints,
            goalkeepers: formData.goalkeepers, equipment: formData.equipment.join(','),
            linked_basics: formData.linkedBasics.join(','), linked_principles: formData.linkedPrinciples.join(','),
            linked_tactics: formData.linkedTactics.join(','), media_url: mediaPreview || formData.mediaUrl
        };

        try {
            let response;
            if (isEditing && formData.id) {
                response = await fetch(`http://127.0.0.1:8000/exercises/${formData.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            } else {
                response = await fetch('http://127.0.0.1:8000/exercises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            }

            if (!response.ok) throw new Error('Server Error');
            const savedRaw = await response.json();
            
            // Format new/updated item to match Frontend Type
            const savedFormatted: Exercise = { 
                ...formData, 
                id: savedRaw.id, 
                isCustom: true, 
                mediaUrl: savedRaw.media_url,
                // Ensure array fields are updated properly
                equipment: savedRaw.equipment ? savedRaw.equipment.split(',') : [],
                linkedBasics: savedRaw.linked_basics ? savedRaw.linked_basics.split(',') : [],
                linkedPrinciples: savedRaw.linked_principles ? savedRaw.linked_principles.split(',') : [],
                linkedTactics: savedRaw.linked_tactics ? savedRaw.linked_tactics.split(',') : []
            };

            if (isEditing) {
                setExercises(prev => prev.map(ex => ex.id === savedFormatted.id ? savedFormatted : ex));
                toast.success('Exercise Updated!');
            } else {
                setExercises(prev => [...prev, savedFormatted]);
                toast.success('Exercise Created!');
            }
            closeModal();
        } catch (error) { toast.error('Failed to save'); }
    };

    const handleDeleteExercise = async (id: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/exercises/${id}`, { method: 'DELETE' });
            if (response.ok) { 
                setExercises(prev => prev.filter(ex => ex.id !== id)); 
                toast.success('Deleted'); 
                setSelectedExercise(null); 
            }
        } catch (e) { toast.error('Connection failed'); }
    };

    // --- UI Helpers ---
    const resetForm = () => {
        setFormData({ id: '', name: '', intensity: 'Medium', description: '', setup: '', variations: '', coachingPoints: '', goalkeepers: 0, equipment: [], linkedBasics: [], linkedPrinciples: [], linkedTactics: [], isCustom: true, mediaUrl: '' });
        setMediaPreview(null); setBasicsSearch(''); setPrinciplesSearch(''); setTacticsSearch(''); setOpenSection(null);
    };

    const closeModal = () => { setShowCreateModal(false); setIsEditing(false); setSelectedExercise(null); resetForm(); };
    const openEditModal = (ex: Exercise) => { setFormData(ex); setMediaPreview(ex.mediaUrl || null); setIsEditing(true); setShowCreateModal(true); };

    const toggleSelection = (field: 'equipment' | 'linkedBasics' | 'linkedPrinciples' | 'linkedTactics', item: string) => {
        const list = formData[field];
        const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
        setFormData({ ...formData, [field]: newList });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 100 * 1024 * 1024) return toast.error("File too large. Max 100MB");
        // Show a local object-URL preview immediately while the upload runs
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

    const filteredExercises = exercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Media Renderer
    const renderMedia = (url: string, isPreview = false) => {
        const type = getMediaType(url);

        const openLightbox = (e: React.MouseEvent) => {
            if (isPreview) {
                e.stopPropagation();
                setViewMedia(url);
            }
        };

        if (type === 'image') return (
            <img
                src={url}
                alt="Preview"
                className={`w-full h-full object-cover rounded-lg ${isPreview ? 'cursor-zoom-in hover:opacity-90 transition-opacity' : ''}`}
                onClick={openLightbox}
            />
        );

        if (type === 'video') return (
            <div
                className={`w-full h-full bg-black rounded-lg flex items-center justify-center relative group ${isPreview ? 'cursor-zoom-in hover:bg-slate-900 transition-colors' : ''}`}
                onClick={openLightbox}
            >
                {isPreview ? (
                    <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-blue-400 transition-colors">
                        <VideoIcon size={32} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Watch Video</span>
                    </div>
                ) : (
                    <video src={url} controls className="w-full h-full rounded-lg" />
                )}
            </div>
        );

        if (type === 'pdf') return (
            <div
                className={`flex flex-col items-center justify-center h-full text-slate-400 bg-slate-900 rounded-lg border border-white/5 ${isPreview ? 'cursor-zoom-in hover:bg-slate-800 transition-colors group' : ''}`}
                onClick={openLightbox}
            >
                <FileText size={48} className="mb-2 group-hover:text-blue-400 transition-colors" />
                <span className="text-sm">PDF Document</span>
                {!isPreview && <a href={url} download="exercise.pdf" className="mt-2 text-blue-500 text-xs hover:underline">Download</a>}
            </div>
        );

        return <div className="flex items-center justify-center h-full text-slate-500">Unsupported Media</div>;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h1 className="text-3xl font-bold text-white tracking-tight">Exercises Library</h1><p className="text-slate-400 mt-1 font-medium">Manage training exercises and drills</p></div>
                <Button onClick={() => { resetForm(); setShowCreateModal(true) }} icon={<Plus size={18} />}>Create Exercise</Button>
            </div>

            <Card className="p-2 px-4">
                <Input icon={<Search size={18} />} placeholder="Search exercises..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border-0 bg-transparent focus:ring-0" />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredExercises.map((ex, idx) => (
                        <Card key={ex.id} animate delay={idx * 0.05} onClick={() => setSelectedExercise(ex)} className="p-6 cursor-pointer hover:border-blue-500/50 flex flex-col h-full group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{ex.name}</h3>
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getIntensityStyles(ex.intensity)}`}>{ex.intensity}</span>
                            </div>

                            <div className="h-40 mb-4 bg-slate-950/50 rounded-xl overflow-hidden flex items-center justify-center border border-white/5 relative">
                                {ex.mediaUrl ? renderMedia(ex.mediaUrl, true) : <ImageIcon size={24} className="text-slate-700" />}

                                {/* Floating "View" Icon on Hover if media exists */}
                                {ex.mediaUrl && (
                                    <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Maximize2 size={14} />
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-slate-400 line-clamp-2 mb-5 leading-relaxed">{ex.description}</p>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {ex.equipment.slice(0, 3).map((e, i) => <span key={i} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-1 rounded border border-white/5">{e}</span>)}
                                {ex.equipment.length > 3 && <span className="text-[10px] text-slate-500 pt-1">+{ex.equipment.length - 3}</span>}
                            </div>
                        </Card>
                    ))}
                </AnimatePresence>
            </div>

            {/* DETAIL MODAL */}
            <Modal isOpen={!!selectedExercise && !showCreateModal} onClose={closeModal} title={selectedExercise?.name || ''} maxWidth="max-w-4xl"
                footer={selectedExercise?.isCustom && (
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => openEditModal(selectedExercise!)} icon={<Edit2 size={16} />}>Edit</Button>
                        <Button variant="danger" onClick={() => handleDeleteExercise(selectedExercise!.id)} icon={<Trash2 size={16} />}>Delete</Button>
                    </div>
                )}
            >
                {selectedExercise && (
                    <div className="space-y-8">
                        <div className="flex gap-3">
                            <span className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider border ${getIntensityStyles(selectedExercise.intensity)}`}>{selectedExercise.intensity} Intensity</span>
                            <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded uppercase tracking-wider">{selectedExercise.goalkeepers} Goalkeepers</span>
                        </div>

                        {selectedExercise.mediaUrl && (
                            <div className="w-full h-96 bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                                {renderMedia(selectedExercise.mediaUrl, true)}
                            </div>
                        )}

                        <div className="space-y-6">
                            {[
                                { label: 'Description', value: selectedExercise.description },
                                { label: 'Setup', value: selectedExercise.setup },
                                { label: 'Coaching Points', value: selectedExercise.coachingPoints },
                            ].map(section => section.value && (
                                <div key={section.label}>
                                    <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">{section.label}</h4>
                                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-slate-300 text-sm leading-relaxed">{section.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                            {[
                                { label: 'RELATED BASICS', items: selectedExercise.linkedBasics, style: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
                                { label: 'RELATED PRINCIPLES', items: selectedExercise.linkedPrinciples, style: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
                                { label: 'RELATED TACTICS', items: selectedExercise.linkedTactics, style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                            ].map(section => (
                                <div key={section.label}>
                                    <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">{section.label}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {section.items.length > 0 ? section.items.map(item => (
                                            <span key={item} className={`px-3 py-1.5 border text-xs rounded-md font-medium ${section.style}`}>
                                                {item}
                                            </span>
                                        )) : <span className="text-xs text-slate-600 italic">None selected</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* CREATE / EDIT FORM MODAL */}
            <Modal isOpen={showCreateModal} onClose={closeModal} title={isEditing ? 'Edit Exercise' : 'Create New Exercise'} maxWidth="max-w-3xl"
                footer={<div className="flex gap-3"><Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button><Button onClick={handleSave} className="flex-1">Save Exercise</Button></div>}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Rondo 4v2" />
                            <div className="grid grid-cols-2 gap-4">
                                <Select label="Intensity" value={formData.intensity} onChange={val => setFormData({ ...formData, intensity: val as any })} options={['Low', 'Medium', 'High'].map(v => ({ label: v, value: v }))} />
                                <Input label="Goalkeepers" type="number" value={formData.goalkeepers} onChange={e => setFormData({ ...formData, goalkeepers: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Visuals</label>
                            <div className="h-32 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl relative group hover:border-blue-500/30 transition-colors flex flex-col items-center justify-center text-slate-500 overflow-hidden cursor-pointer">
                                {mediaPreview ? (
                                    <>
                                        {getMediaType(mediaPreview) === 'image' && <img src={mediaPreview} className="w-full h-full object-cover" />}
                                        {getMediaType(mediaPreview) === 'video' && <VideoIcon size={32} className="text-slate-400" />}
                                        {getMediaType(mediaPreview) === 'pdf' && <FileText size={32} className="text-slate-400" />}
                                        <button onClick={(e) => { e.stopPropagation(); setMediaPreview(null); setFormData({ ...formData, mediaUrl: '' }); }} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"><X size={14} /></button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:text-blue-400 transition-colors">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Upload Media</span>
                                        <input type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={handleFileUpload} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {['Description', 'Setup', 'Variations', 'Coaching Points'].map(field => (
                            <div key={field}>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">{field}</label>
                                <textarea
                                    className="w-full bg-slate-900/50 border border-white/5 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all focus:bg-slate-900 focus:border-blue-500/50 hover:border-white/10 resize-none h-20 custom-scrollbar placeholder:text-slate-600"
                                    value={(formData as any)[field === 'Coaching Points' ? 'coachingPoints' : field.toLowerCase()]}
                                    onChange={e => setFormData({ ...formData, [field === 'Coaching Points' ? 'coachingPoints' : field.toLowerCase()]: e.target.value })}
                                    placeholder={`Enter ${field.toLowerCase()}...`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-[1px] bg-white/5"></div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Equipment</label>
                        <div className="flex flex-wrap gap-2">
                            {equipmentOptions.map(item => (
                                <button key={item} type="button" onClick={() => toggleSelection('equipment', item)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${formData.equipment.includes(item) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'}`}>
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-white/5"></div>

                    <div className="space-y-3">
                        {[
                            { label: 'Related Basics', list: allBasics, field: 'linkedBasics' as const, search: basicsSearch, setSearch: setBasicsSearch, color: 'text-blue-400', borderHover: 'hover:border-blue-500/30' },
                            { label: 'Related Principles', list: allPrinciples, field: 'linkedPrinciples' as const, search: principlesSearch, setSearch: setPrinciplesSearch, color: 'text-purple-400', borderHover: 'hover:border-purple-500/30' },
                            { label: 'Related Tactics', list: allTactics, field: 'linkedTactics' as const, search: tacticsSearch, setSearch: setTacticsSearch, color: 'text-emerald-400', borderHover: 'hover:border-emerald-500/30' },
                        ].map(section => {
                            const isOpen = openSection === section.label;
                            const count = formData[section.field].length;
                            return (
                                <div key={section.label} className={`bg-slate-900/30 border border-white/5 rounded-xl overflow-hidden transition-colors ${section.borderHover}`}>
                                    <button onClick={() => setOpenSection(isOpen ? null : section.label)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
                                        <span className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isOpen ? section.color : 'text-slate-400'}`}>
                                            {section.label}
                                            {count > 0 && <span className={`bg-white/10 px-2 py-0.5 rounded-md text-[10px] text-white`}>{count} Selected</span>}
                                        </span>
                                        {isOpen ? <ChevronDown size={16} className={section.color} /> : <ChevronRight size={16} className="text-slate-500" />}
                                    </button>
                                    {isOpen && (
                                        <div className="p-4 pt-0 border-t border-white/5">
                                            <div className="flex items-center gap-2 mb-3 mt-3">
                                                <Search size={14} className="text-slate-500" />
                                                <input className="bg-transparent outline-none text-sm w-full text-slate-300 placeholder-slate-600" placeholder={`Search ${section.label.toLowerCase()}...`} value={section.search} onChange={e => section.setSearch(e.target.value)} />
                                            </div>
                                            <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                                                {section.list.filter(item => item.name.toLowerCase().includes(section.search.toLowerCase())).map(item => (
                                                    <label key={item.id} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors group">
                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${formData[section.field].includes(item.name) ? `bg-current border-current ${section.color}` : 'border-slate-600 group-hover:border-slate-500'}`}>
                                                            {formData[section.field].includes(item.name) && <Check size={12} className="text-black" />}
                                                        </div>
                                                        <span className="text-sm text-slate-300">{item.name}</span>
                                                        <input type="checkbox" className="hidden" checked={formData[section.field].includes(item.name)} onChange={() => toggleSelection(section.field, item.name)} />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {/* LIGHTBOX VIEWER */}
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