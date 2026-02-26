import { useState, useEffect } from 'react';
import { Plus, X, Calendar, Clock, Trash2, Edit2, User, Activity, Download, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { formatDate } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Modal } from "./ui/Modal";
import { DatePicker } from "./ui/DatePicker";
import { TimePicker } from "./ui/TimePicker";

// --- Interfaces ---
interface Player {
    id: string;
    name: string;
}

interface Exercise {
    id: string;
    name: string;
    description?: string;
    setup?: string;
    coaching_points?: string;
    intensity?: string;
    equipment?: string[];
    linkedBasics?: string[];
    linkedPrinciples?: string[];
    linkedTactics?: string[];
    mediaUrl?: string;
}

interface TrainingSession {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    focus: string;
    intensity: string;
    selectedPlayers: string[];
    selectedExercises: string[];
}

export default function TrainingManager() {
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [allExercises, setAllExercises] = useState<Exercise[]>([]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '11:00',
        focus: '',
        intensity: 'Medium',
        selectedPlayerIds: [] as string[],
        selectedExerciseIds: [] as string[]
    });

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    // --- 1. LOAD DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const sRes = await fetch('http://127.0.0.1:8000/training_sessions');
                if (sRes.ok) {
                    const data = await sRes.json();
                    setSessions(data.map((s: any) => ({
                        id: s.id, date: s.date, startTime: s.start_time, endTime: s.end_time,
                        focus: s.focus, intensity: s.intensity,
                        selectedPlayers: s.selected_players ? s.selected_players.split(',') : [],
                        selectedExercises: s.selected_exercises ? s.selected_exercises.split(',') : []
                    })));
                }

                const pRes = await fetch('http://127.0.0.1:8000/players');
                if (pRes.ok) {
                    const dbPlayers = await pRes.json();
                    setAllPlayers(dbPlayers.map((p: any) => ({ id: p.id, name: `${p.first_name} ${p.last_name}` })));
                }

                const eRes = await fetch('http://127.0.0.1:8000/exercises');
                if (eRes.ok) {
                    const dbExercises = await eRes.json();
                    setAllExercises(dbExercises.map((e: any) => ({
                        id: e.id, name: e.name, description: e.description, setup: e.setup,
                        coaching_points: e.coaching_points, intensity: e.intensity,
                        equipment: e.equipment ? e.equipment.split(',') : [],
                        linkedBasics: e.linked_basics ? e.linked_basics.split(',') : [],
                        linkedPrinciples: e.linked_principles ? e.linked_principles.split(',') : [],
                        linkedTactics: e.linked_tactics ? e.linked_tactics.split(',') : [],
                        mediaUrl: e.media_url
                    })));
                }
            } catch (e) { toast.error("Failed to connect to server"); }
        };
        fetchData();
    }, []);

    // --- 2. HELPERS & ACTIONS ---
    useEffect(() => {
        if (showCreateModal && !isEditing) {
            setFormData(prev => ({ ...prev, selectedPlayerIds: allPlayers.map(p => p.id) }));
        }
    }, [showCreateModal, isEditing, allPlayers]);

    const handleSave = async () => {
        if (!formData.focus) return toast.error("Focus is required");
        const payload = {
            date: formData.date, start_time: formData.startTime, end_time: formData.endTime,
            focus: formData.focus, intensity: formData.intensity,
            selected_players: formData.selectedPlayerIds.join(','),
            selected_exercises: formData.selectedExerciseIds.join(',')
        };

        try {
            let res;
            if (isEditing && editingId) {
                res = await fetch(`http://127.0.0.1:8000/training_sessions/${editingId}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('http://127.0.0.1:8000/training_sessions', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                const saved = await res.json();
                const newItem = {
                    id: saved.id, date: saved.date, startTime: saved.start_time, endTime: saved.end_time,
                    focus: saved.focus, intensity: saved.intensity,
                    selectedPlayers: saved.selected_players ? saved.selected_players.split(',') : [],
                    selectedExercises: saved.selected_exercises ? saved.selected_exercises.split(',') : []
                };
                if (isEditing) {
                    setSessions(prev => prev.map(s => s.id === newItem.id ? newItem : s));
                    toast.success("Session Updated");
                } else {
                    setSessions(prev => [...prev, newItem]);
                    toast.success("Session Created");
                }
                closeModal();
            }
        } catch { toast.error("Connection failed"); }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`http://127.0.0.1:8000/training_sessions/${id}`, { method: 'DELETE' });
            setSessions(prev => prev.filter(s => s.id !== id));
            toast.success("Deleted");
        } catch (e) { toast.error("Failed to delete"); }
    };

    // --- 3. PDF EXPORT ---
    const generatePDF = (session: TrainingSession) => {
        const doc = new jsPDF({ orientation: "landscape" });

        // Header
        doc.setFillColor(15, 23, 42); // Dark Slate 900
        doc.rect(0, 0, 297, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("TRAINING SESSION PLAN", 148, 12, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text(`${session.date}  |  ${session.startTime} - ${session.endTime}  |  Focus: ${session.focus}  |  Intensity: ${session.intensity}`, 148, 22, { align: "center" });

        let finalY = 40;

        // Get Ordered Exercises
        const sessionExercises = session.selectedExercises
            .map(id => allExercises.find(ex => ex.id === id))
            .filter((ex): ex is Exercise => ex !== undefined);

        if (sessionExercises.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text("Session Exercises", 14, finalY);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Exercise', 'Diagram', 'Setup', 'Description', 'Coaching Points', 'Equipment', 'Related Items']],
                body: sessionExercises.map(ex => {
                    const related = [
                        ex.linkedBasics?.length ? `Basics: ${ex.linkedBasics.join(', ')}` : '',
                        ex.linkedPrinciples?.length ? `Principles: ${ex.linkedPrinciples.join(', ')}` : '',
                        ex.linkedTactics?.length ? `Tactics: ${ex.linkedTactics.join(', ')}` : ''
                    ].filter(s => s).join('\n');

                    return [
                        ex.name,
                        '',
                        ex.setup || '-',
                        ex.description || '-',
                        ex.coaching_points || '-',
                        ex.equipment?.join(', ') || '-',
                        related || '-'
                    ];
                }),
                headStyles: { fillColor: [37, 99, 235], textColor: 255 },
                styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', minCellHeight: 25 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 25 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 50 },
                    4: { cellWidth: 35 },
                    5: { cellWidth: 25 },
                    6: { cellWidth: 'auto' }
                },
                didDrawCell: (data) => {
                    if (data.column.index === 1 && data.row.section === 'body') {
                        const ex = sessionExercises[data.row.index];
                        if (ex.mediaUrl && ex.mediaUrl.startsWith('data:image')) {
                            try {
                                const imgProps = doc.getImageProperties(ex.mediaUrl);
                                const ratio = imgProps.width / imgProps.height;
                                const cellWidth = data.cell.width - 4;
                                const cellHeight = data.cell.height - 4;
                                let w = cellWidth;
                                let h = w / ratio;
                                if (h > cellHeight) { h = cellHeight; w = h * ratio; }
                                doc.addImage(ex.mediaUrl, 'JPEG', data.cell.x + 2, data.cell.y + 2, w, h);
                            } catch (e) { }
                        }
                    }
                }
            });
            finalY = (doc as any).lastAutoTable.finalY + 15;
        }

        const sessionPlayers = allPlayers.filter(p => session.selectedPlayers.includes(p.id));
        if (sessionPlayers.length > 0) {
            if (finalY > 150) { doc.addPage(); finalY = 20; }
            doc.setFontSize(12); doc.setTextColor(15, 23, 42);
            doc.text(`Attending Players (${sessionPlayers.length})`, 14, finalY);
            doc.setFontSize(9); doc.setTextColor(0, 0, 0);
            let x = 14; let y = finalY + 8;
            sessionPlayers.forEach((p, index) => {
                doc.text(`• ${p.name}`, x, y);
                y += 5;
                if (y > 190) { y = finalY + 8; x += 50; if (x > 250) { doc.addPage(); x = 14; y = 20; } }
                if ((index + 1) % 15 === 0 && index !== 0) { x += 50; y = finalY + 8; }
            });
        }

        doc.save(`Training_Session_${session.date}.pdf`);
        toast.success("PDF Downloaded");
    };

    // --- 4. UI HELPERS ---
    const openCreate = () => { setIsEditing(false); setEditingId(null); setFormData({ date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '11:00', focus: '', intensity: 'Medium', selectedPlayerIds: allPlayers.map(p => p.id), selectedExerciseIds: [] }); setShowCreateModal(true); };
    const openEdit = (s: TrainingSession) => { setIsEditing(true); setEditingId(s.id); setFormData({ date: s.date, startTime: s.startTime, endTime: s.endTime, focus: s.focus, intensity: s.intensity, selectedPlayerIds: s.selectedPlayers, selectedExerciseIds: s.selectedExercises }); setShowCreateModal(true); };
    const closeModal = () => setShowCreateModal(false);
    const togglePlayer = (id: string) => { setFormData(prev => { const exists = prev.selectedPlayerIds.includes(id); return { ...prev, selectedPlayerIds: exists ? prev.selectedPlayerIds.filter(pid => pid !== id) : [...prev.selectedPlayerIds, id] }; }); };
    const toggleExercise = (id: string) => { setFormData(prev => { const exists = prev.selectedExerciseIds.includes(id); return { ...prev, selectedExerciseIds: exists ? prev.selectedExerciseIds.filter(eid => eid !== id) : [...prev.selectedExerciseIds, id] }; }); };

    const today = new Date().toISOString().split('T')[0];
    const upcomingSessions = sessions
        .filter(s => s.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));
    const pastSessions = sessions
        .filter(s => s.date < today)
        .sort((a, b) => b.date.localeCompare(a.date));
    const displaySessions = activeTab === 'upcoming' ? upcomingSessions : pastSessions;

    return (
        <div className="relative min-h-screen p-8 max-w-7xl mx-auto space-y-6 overflow-hidden">

            {/* Background Blobs */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Training Sessions</h1>
                    <p className="text-slate-400 mt-1">Plan, Execute, Analyze</p>
                </div>
                <Button onClick={openCreate} icon={<Plus size={18} />} className="shadow-lg shadow-blue-500/20">
                    New Session
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900/50 border border-white/5 rounded-xl w-fit">
                {([
                    { key: 'upcoming', label: 'Upcoming', count: upcomingSessions.length },
                    { key: 'past',     label: 'Past',     count: pastSessions.length },
                ] as const).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            activeTab === tab.key
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                        }`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {displaySessions.map((s, idx) => (
                        <Card
                            key={s.id}
                            animate
                            delay={idx * 0.05}
                            className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg group relative overflow-hidden"
                        >
                            {/* Decorative left accent */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
                                activeTab === 'past'
                                    ? 'from-slate-500 to-slate-600'
                                    : 'from-blue-500 to-indigo-600'
                            }`}></div>

                            <div className="flex-1 pl-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700/50`}>
                                        {s.intensity}
                                    </span>
                                    <h3 className="text-lg font-bold text-white">{s.focus}</h3>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-2">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" /> {formatDate(s.date)}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {s.startTime} - {s.endTime}</span>
                                    <span className="flex items-center gap-1.5"><Activity size={14} className="text-emerald-500" /> {s.selectedExercises.length} Drills</span>
                                    <span className="flex items-center gap-1.5"><User size={14} className="text-purple-500" /> {s.selectedPlayers.length} Players</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button variant="secondary" onClick={(e) => { e.stopPropagation(); generatePDF(s); }} className="p-2.5" title="Export PDF">
                                    <Download size={18} />
                                </Button>
                                <Button variant="secondary" onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="p-2.5" title="Edit">
                                    <Edit2 size={18} />
                                </Button>
                                <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-2.5" title="Delete">
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </AnimatePresence>
                {displaySessions.length === 0 && (
                    <div className="p-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                        {activeTab === 'upcoming' ? 'No upcoming sessions scheduled.' : 'No past sessions recorded.'}
                    </div>
                )}
            </div>

            <Modal
                isOpen={showCreateModal}
                onClose={closeModal}
                title={isEditing ? 'Edit Session' : 'Plan Session'}
                icon={<Activity size={20} />}
                maxWidth="max-w-5xl"
                footer={
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={closeModal} className="flex-1 text-slate-400 hover:text-white hover:bg-white/5">Discard</Button>
                        <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
                            {isEditing ? 'Save Changes' : 'Schedule Session'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-8">
                    {/* 1. Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="md:col-span-2">
                            <Input
                                label="Primary Focus"
                                placeholder="e.g. High Press & Transition"
                                value={formData.focus}
                                onChange={e => setFormData({ ...formData, focus: e.target.value })}
                            />
                        </div>
                        <DatePicker
                            label="Date"
                            value={formData.date}
                            onChange={date => setFormData({ ...formData, date })}
                        />
                        <Select
                            label="Intensity"
                            value={formData.intensity}
                            onChange={(val) => setFormData({ ...formData, intensity: val as string })}
                            options={[
                                { label: 'Low', value: 'Low' },
                                { label: 'Medium', value: 'Medium' },
                                { label: 'High', value: 'High' }
                            ]}
                        />
                        <TimePicker
                            label="Start Time"
                            value={formData.startTime}
                            onChange={time => setFormData({ ...formData, startTime: time })}
                        />
                        <TimePicker
                            label="End Time"
                            value={formData.endTime}
                            onChange={time => setFormData({ ...formData, endTime: time })}
                        />
                    </div>

                    <div className="w-full h-[1px] bg-white/5"></div>

                    {/* 2. Player Selection */}
                    <div>
                        <h3 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-4">Player Availability</h3>
                        <div className="flex flex-wrap gap-2">
                            {allPlayers.map(p => {
                                const isSelected = formData.selectedPlayerIds.includes(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => togglePlayer(p.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isSelected
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                                : 'bg-slate-900/50 text-slate-500 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        {p.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-white/5"></div>

                    {/* 3. Exercise Selection - Two Column Design */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Available Column */}
                        <div>
                            <h3 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-3 flex justify-between">
                                Available Drills
                                <span className="bg-slate-800 px-2 rounded text-[10px] py-0.5 text-slate-300 border border-slate-700">{allExercises.length - formData.selectedExerciseIds.length}</span>
                            </h3>
                            <div className="bg-slate-900/30 border border-white/5 rounded-xl p-2 h-80 overflow-y-auto space-y-2 custom-scrollbar">
                                {allExercises.filter(ex => !formData.selectedExerciseIds.includes(ex.id)).map(ex => (
                                    <div key={ex.id} onClick={() => toggleExercise(ex.id)} className="p-3 bg-slate-900/50 rounded-lg shadow-sm border border-white/5 hover:border-blue-500/50 cursor-pointer group transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-slate-200">{ex.name}</span>
                                            <Plus size={16} className="text-slate-500 group-hover:text-blue-500" />
                                        </div>
                                        <div className="mt-1 flex gap-2">
                                            <span className="text-[10px] text-slate-400 px-1.5 bg-slate-950 rounded border border-white/5">{ex.intensity || 'Med'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Selected Column */}
                        <div>
                            <h3 className="text-[11px] uppercase tracking-widest font-bold text-blue-500 mb-3 flex justify-between">
                                Selected Sequence
                                <span className="bg-blue-500/10 text-blue-400 px-2 rounded text-[10px] py-0.5 border border-blue-500/20">{formData.selectedExerciseIds.length}</span>
                            </h3>
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-2 h-80 overflow-y-auto space-y-2 custom-scrollbar">
                                {formData.selectedExerciseIds.map((id, index) => {
                                    const ex = allExercises.find(e => e.id === id);
                                    if (!ex) return null;
                                    return (
                                        <div key={id} onClick={() => toggleExercise(id)} className="p-3 bg-slate-900 rounded-lg shadow-sm border-l-4 border-l-blue-500 cursor-pointer group border-y border-r border-white/5">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">{index + 1}</span>
                                                    <span className="text-sm font-medium text-white">{ex.name}</span>
                                                </div>
                                                <X size={16} className="text-slate-500 group-hover:text-red-500 transition-colors" />
                                            </div>
                                        </div>
                                    );
                                })}
                                {formData.selectedExerciseIds.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs italic">
                                        <ArrowRight className="mb-2 opacity-50" />
                                        Select drills from the left
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}