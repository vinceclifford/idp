import { useState, useEffect } from 'react';
import { Search, Edit2, Plus, Trash2, Camera, Shield, Hash, Ruler, Weight, User, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Modal } from "./ui/Modal";
import { DatePicker } from "./ui/DatePicker";
import { uploadFile } from "../lib/uploadFile";
import { PlayerRowSkeleton } from "./ui/Skeleton";

// --- Types ---
interface Player {
    id: string; firstName: string; lastName: string; dateOfBirth: string; position: string;
    jerseyNumber: number; status: string; playerPhone: string; height: number; weight: number;
    motherName: string; motherPhone: string; fatherName: string; fatherPhone: string;
    imageUrl: string; attendance: number; performance: number;
}

export default function TeamManagement() {
    const [players, setPlayers] = useState<Player[]>([]); // Initialize empty (No Mock Data)
    const [searchQuery, setSearchQuery] = useState('');
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [computedAttendance, setComputedAttendance] = useState<Record<string, number>>({});
    const [editingPerf, setEditingPerf] = useState<string | null>(null);
    const [perfDraft, setPerfDraft] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState<Player>({
        id: '', firstName: '', lastName: '', dateOfBirth: '', position: 'Forward', jerseyNumber: 0, status: 'Active', playerPhone: '', height: 0, weight: 0, motherName: '', motherPhone: '', fatherName: '', fatherPhone: '', imageUrl: '', attendance: 0, performance: 0
    });

    // --- Load Data ---
    useEffect(() => {
        fetch('http://127.0.0.1:8000/players')
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    setPlayers(data.map((p: any) => ({
                        id: p.id,
                        firstName: p.first_name,
                        lastName: p.last_name,
                        dateOfBirth: p.date_of_birth,
                        position: p.position,
                        jerseyNumber: p.jersey_number,
                        status: p.status,
                        playerPhone: p.player_phone || '',
                        height: p.height,
                        weight: p.weight,
                        motherName: p.mother_name || '',
                        motherPhone: p.mother_phone || '',
                        fatherName: p.father_name || '',
                        fatherPhone: p.father_phone || '',
                        imageUrl: p.image_url || '',
                        attendance: p.attendance,
                        performance: p.performance
                    })));
                }
            })
            .catch(() => console.log("Backend offline"))
            .finally(() => setLoading(false));

        // Compute real attendance from training sessions
        fetch('http://127.0.0.1:8000/training_sessions')
            .then(res => res.json())
            .then((sessions: any[]) => {
                if (sessions.length === 0) return;
                const countMap: Record<string, number> = {};
                sessions.forEach(s => {
                    (s.selected_players || '').split(',').forEach((id: string) => {
                        const trimmed = id.trim();
                        if (trimmed) countMap[trimmed] = (countMap[trimmed] || 0) + 1;
                    });
                });
                const pctMap: Record<string, number> = {};
                Object.entries(countMap).forEach(([id, count]) => {
                    pctMap[id] = Math.round((count / sessions.length) * 100);
                });
                setComputedAttendance(pctMap);
            })
            .catch(() => {});
    }, []);

    // --- Handlers ---
    const handleSave = async () => {
        if (!formData.firstName || !formData.lastName) {
            toast.error('Name required');
            return;
        }

        const isEditMode = !!editingId && !!formData.id;

        try {
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                date_of_birth: formData.dateOfBirth,
                position: formData.position,
                status: formData.status,
                jersey_number: parseInt(String(formData.jerseyNumber || 0)),
                height: parseInt(String(formData.height || 0)),
                weight: parseInt(String(formData.weight || 0)),
                player_phone: formData.playerPhone || "",
                image_url: formData.imageUrl || "",
                mother_name: formData.motherName || "",
                mother_phone: formData.motherPhone || "",
                father_name: formData.fatherName || "",
                father_phone: formData.fatherPhone || "",
                attendance: 0,
                performance: formData.performance ?? 0
            };

            const url = isEditMode
                ? `http://127.0.0.1:8000/players/${formData.id}`
                : 'http://127.0.0.1:8000/players';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const savedPlayer = await response.json();
                const formattedPlayer = {
                    id: savedPlayer.id,
                    firstName: savedPlayer.first_name,
                    lastName: savedPlayer.last_name,
                    dateOfBirth: savedPlayer.date_of_birth,
                    position: savedPlayer.position,
                    jerseyNumber: savedPlayer.jersey_number,
                    status: savedPlayer.status,
                    playerPhone: savedPlayer.player_phone || '',
                    height: savedPlayer.height,
                    weight: savedPlayer.weight,
                    motherName: savedPlayer.mother_name || '',
                    motherPhone: savedPlayer.mother_phone || '',
                    fatherName: savedPlayer.father_name || '',
                    fatherPhone: savedPlayer.father_phone || '',
                    imageUrl: savedPlayer.image_url || '',
                    attendance: savedPlayer.attendance,
                    performance: savedPlayer.performance
                };

                if (isEditMode) {
                    setPlayers(prev => prev.map(p => p.id === formattedPlayer.id ? formattedPlayer : p));
                } else {
                    setPlayers(prev => [...prev, formattedPlayer]);
                }

                toast.success("Player saved!");
                setShowPlayerModal(false);
            } else {
                toast.error("Server rejected the data");
            }
        } catch (error) {
            toast.error('Connection failed');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`http://127.0.0.1:8000/players/${id}`, { method: 'DELETE' });
            setPlayers(prev => prev.filter(p => p.id !== id));
            toast.success('Player deleted');
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Show a local preview immediately while the upload runs
        const localPreview = URL.createObjectURL(file);
        setImagePreview(localPreview);
        try {
            const url = await uploadFile(file);
            setImagePreview(url);
            setFormData(prev => ({ ...prev, imageUrl: url }));
        } catch {
            toast.error('Image upload failed. Please try again.');
            setImagePreview('');
        }
    };

    const openCreate = () => {
        setEditingId(null);
        setImagePreview('');
        setFormData({ id: '', firstName: '', lastName: '', dateOfBirth: '', position: 'Forward', jerseyNumber: 0, status: 'Active', playerPhone: '', height: 0, weight: 0, motherName: '', motherPhone: '', fatherName: '', fatherPhone: '', imageUrl: '', attendance: 0, performance: 0 });
        setShowPlayerModal(true);
    };

    const openEdit = (player: Player) => {
        setEditingId(player.id);
        setFormData(player);
        setImagePreview(player.imageUrl);
        setShowPlayerModal(true);
    };

    // Save inline performance rating for a player
    const savePerformance = async (player: Player, value: number) => {
        const clamped = Math.max(0, Math.min(10, value));
        try {
            const payload = {
                first_name: player.firstName, last_name: player.lastName,
                date_of_birth: player.dateOfBirth, position: player.position,
                status: player.status, jersey_number: player.jerseyNumber,
                height: player.height, weight: player.weight,
                player_phone: player.playerPhone, image_url: player.imageUrl,
                mother_name: player.motherName, mother_phone: player.motherPhone,
                father_name: player.fatherName, father_phone: player.fatherPhone,
                attendance: player.attendance, performance: clamped
            };
            const res = await fetch(`http://127.0.0.1:8000/players/${player.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (res.ok) {
                setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, performance: clamped } : p));
                toast.success('Performance updated');
            }
        } catch { toast.error('Failed to save'); }
        setEditingPerf(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Injured': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'Away': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getPerfColor = (score: number) => {
        if (score >= 7) return { bar: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]', text: 'text-emerald-400' };
        if (score >= 4) return { bar: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]', text: 'text-amber-400' };
        return { bar: 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]', text: 'text-rose-400' };
    };

    const filteredPlayers = players.filter(p => p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || p.lastName.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-10 rounded-full bg-indigo-500 flex-shrink-0" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Squad Roster</h1>
                        <p className="text-sm text-slate-400 mt-0.5">Manage player profiles and status</p>
                    </div>
                </div>
                <Button onClick={openCreate} icon={<Plus size={18} />} className="shadow-lg shadow-blue-500/20">Add Player</Button>
            </div>

            <Input icon={<Search size={18} />} placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

            <Card className="overflow-hidden border-white/5 bg-slate-900/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 backdrop-blur-sm bg-slate-950/80">
                            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Player</th>
                                <th className="px-6 py-4">Position</th>
                                <th className="px-6 py-4">Attendance</th>
                                <th className="px-6 py-4">Performance</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && Array.from({ length: 5 }).map((_, i) => <PlayerRowSkeleton key={i} />)}
                            {!loading && filteredPlayers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-500">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                                <Users className="w-8 h-8 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-400">{searchQuery ? 'No players found' : 'No players yet'}</p>
                                                <p className="text-sm mt-1">{searchQuery ? 'Try a different search term.' : 'Add your first player to get started.'}</p>
                                            </div>
                                            {!searchQuery && (
                                                <button onClick={openCreate} className="mt-2 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-colors">
                                                    Add Player
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                            <AnimatePresence>
                                {!loading && filteredPlayers.map((player, idx) => (
                                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={player.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500">{player.jerseyNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20">
                                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                                        {player.imageUrl ? <img src={player.imageUrl} className="w-full h-full object-cover" /> : <span className="font-bold text-blue-500">{player.firstName[0]}</span>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{player.firstName} {player.lastName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 text-slate-300 text-xs font-medium border border-white/5"><Shield size={12} /> {player.position}</span></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${computedAttendance[player.id] ?? player.attendance}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-400">{computedAttendance[player.id] ?? player.attendance}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingPerf === player.id ? (
                                                <div className="flex items-center gap-2 min-w-[140px]">
                                                    <input
                                                        type="range"
                                                        min={0} max={10} step={1}
                                                        value={perfDraft}
                                                        onChange={e => setPerfDraft(parseInt(e.target.value))}
                                                        onKeyDown={e => { if (e.key === 'Enter') savePerformance(player, perfDraft); if (e.key === 'Escape') setEditingPerf(null); }}
                                                        autoFocus
                                                        className="flex-1 h-1.5 rounded-full appearance-none bg-slate-700 accent-blue-500 cursor-pointer"
                                                    />
                                                    <span className={`text-xs font-bold w-4 tabular-nums ${getPerfColor(perfDraft).text}`}>{perfDraft}</span>
                                                    <button onClick={() => savePerformance(player, perfDraft)} className="text-[10px] font-bold text-blue-400 hover:text-blue-300">✓</button>
                                                    <button onClick={() => setEditingPerf(null)} className="text-[10px] font-bold text-slate-500 hover:text-slate-300">✕</button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex items-center gap-3 group/perf cursor-pointer"
                                                    onClick={() => { setEditingPerf(player.id); setPerfDraft(player.performance); }}
                                                    title="Click to edit"
                                                >
                                                    <div className="flex-1 w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${getPerfColor(player.performance).bar}`} style={{ width: `${player.performance * 10}%` }}></div>
                                                    </div>
                                                    <span className={`text-xs font-bold w-8 ${getPerfColor(player.performance).text}`}>{player.performance}</span>
                                                    <TrendingUp size={12} className="text-slate-700 group-hover/perf:text-blue-400 transition-colors" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(player.status)}`}>{player.status}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(player)} className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(player.id)} className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={showPlayerModal}
                onClose={() => setShowPlayerModal(false)}
                title={editingId ? 'Edit Profile' : 'New Signing'}
                icon={<User size={20} />}
                footer={
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setShowPlayerModal(false)} className="flex-1 text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
                        <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25 hover:shadow-lg transition-all">{editingId ? 'Save Changes' : 'Create Profile'}</Button>
                    </div>
                }
            >
                <div className="space-y-8">
                    <div className="flex flex-col items-center py-4">
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden group-hover:border-blue-500/50 transition-colors">
                                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Camera className="text-slate-600 w-12 h-12" />}
                            </div>
                            <label className="absolute bottom-1 right-1 p-2.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 cursor-pointer shadow-lg shadow-blue-600/50 border-4 border-slate-950 transition-transform hover:scale-110">
                                <Camera size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[11px] uppercase tracking-widest font-bold text-blue-500 mb-6 flex items-center gap-3">
                                <span className="w-6 h-[2px] bg-blue-500/50 rounded-full"></span>Identity & Position<span className="flex-1 h-[1px] bg-gradient-to-r from-blue-500/20 to-transparent"></span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '') })} placeholder="e.g. Marcus" />
                                <Input label="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '') })} placeholder="e.g. Rashford" />
                                <DatePicker label="Date of Birth" value={formData.dateOfBirth} onChange={date => setFormData({ ...formData, dateOfBirth: date })} />
                                <Select label="Position" value={formData.position} onChange={(value) => setFormData({ ...formData, position: value as string })} options={[{ label: 'Forward', value: 'Forward' }, { label: 'Midfielder', value: 'Midfielder' }, { label: 'Defender', value: 'Defender' }, { label: 'Goalkeeper', value: 'Goalkeeper' }]} />
                                <Input label="Jersey Number" type="text" inputMode="numeric" icon={<Hash size={14} />} value={formData.jerseyNumber || ''} onChange={e => { const raw = e.target.value.replace(/\D/g, ''); const v = raw === '' ? 0 : Math.min(99, parseInt(raw)); setFormData({ ...formData, jerseyNumber: v }); }} className="font-mono font-bold" />
                                <Select label="Status" value={formData.status} onChange={(value) => setFormData({ ...formData, status: value as string })} options={[{ label: 'Active', value: 'Active' }, { label: 'Injured', value: 'Injured' }, { label: 'Away', value: 'Away' }]} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[11px] uppercase tracking-widest font-bold text-emerald-500 mb-6 flex items-center gap-3">
                                <span className="w-6 h-[2px] bg-emerald-500/50 rounded-full"></span>Physical Metrics<span className="flex-1 h-[1px] bg-gradient-to-r from-emerald-500/20 to-transparent"></span>
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Height" type="text" inputMode="numeric" icon={<Ruler size={14} />} rightElement="cm" value={formData.height || ''} onChange={e => { const raw = e.target.value.replace(/\D/g, ''); const v = raw === '' ? 0 : Math.min(250, parseInt(raw)); setFormData({ ...formData, height: v }); }} />
                                <Input label="Weight" type="text" inputMode="numeric" icon={<Weight size={14} />} rightElement="kg" value={formData.weight || ''} onChange={e => { const raw = e.target.value.replace(/\D/g, ''); const v = raw === '' ? 0 : Math.min(200, parseInt(raw)); setFormData({ ...formData, weight: v }); }} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[11px] uppercase tracking-widest font-bold text-purple-500 mb-6 flex items-center gap-3">
                                <span className="w-6 h-[2px] bg-purple-500/50 rounded-full"></span>Contact & Family<span className="flex-1 h-[1px] bg-gradient-to-r from-purple-500/20 to-transparent"></span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input className="md:col-span-2" label="Player's Phone" value={formData.playerPhone} onChange={e => setFormData({ ...formData, playerPhone: e.target.value.replace(/[^0-9+\-\s()]/g, '') })} placeholder="+1 (555) 000-0000" />
                                <Input label="Mother's Name" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '') })} />
                                <Input label="Mother's Phone" value={formData.motherPhone} onChange={e => setFormData({ ...formData, motherPhone: e.target.value.replace(/[^0-9+\-\s()]/g, '') })} />
                                <Input label="Father's Name" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '') })} />
                                <Input label="Father's Phone" value={formData.fatherPhone} onChange={e => setFormData({ ...formData, fatherPhone: e.target.value.replace(/[^0-9+\-\s()]/g, '') })} />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}