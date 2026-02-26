import { useState, useEffect } from 'react';
import { Search, Edit2, Plus, Trash2, Camera, Shield, Hash, Ruler, Weight, User } from 'lucide-react';
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
            .catch(() => console.log("Backend offline"));
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
                performance: 0
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Injured': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'Away': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const filteredPlayers = players.filter(p => p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || p.lastName.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="relative min-h-screen p-8 max-w-7xl mx-auto space-y-6 overflow-hidden">
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Squad Roster</h1>
                    <p className="text-slate-400 mt-1">Manage player profiles and status</p>
                </div>
                <Button onClick={openCreate} icon={<Plus size={18} />} className="shadow-lg shadow-blue-500/20">Add Player</Button>
            </div>

            <Input icon={<Search size={18} />} placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

            <Card className="overflow-hidden border-white/5 bg-slate-900/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500 font-semibold bg-slate-950/30">
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Player</th>
                                <th className="px-6 py-4">Position</th>
                                <th className="px-6 py-4">Attendance</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredPlayers.map((player, idx) => (
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
                                                <div className="flex-1 w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${player.attendance}%` }}></div></div>
                                                <span className="text-xs font-bold text-slate-400">{player.attendance}%</span>
                                            </div>
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
                                <Input label="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="e.g. Marcus" />
                                <Input label="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="e.g. Rashford" />
                                <DatePicker label="Date of Birth" value={formData.dateOfBirth} onChange={date => setFormData({ ...formData, dateOfBirth: date })} />
                                <Select label="Position" value={formData.position} onChange={(value) => setFormData({ ...formData, position: value as string })} options={[{ label: 'Forward', value: 'Forward' }, { label: 'Midfielder', value: 'Midfielder' }, { label: 'Defender', value: 'Defender' }, { label: 'Goalkeeper', value: 'Goalkeeper' }]} />
                                <Input label="Jersey Number" type="number" icon={<Hash size={14} />} value={formData.jerseyNumber || ''} onChange={e => setFormData({ ...formData, jerseyNumber: parseInt(e.target.value) || 0 })} className="font-mono font-bold" />
                                <Select label="Status" value={formData.status} onChange={(value) => setFormData({ ...formData, status: value as string })} options={[{ label: 'Active', value: 'Active' }, { label: 'Injured', value: 'Injured' }, { label: 'Away', value: 'Away' }]} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[11px] uppercase tracking-widest font-bold text-emerald-500 mb-6 flex items-center gap-3">
                                <span className="w-6 h-[2px] bg-emerald-500/50 rounded-full"></span>Physical Metrics<span className="flex-1 h-[1px] bg-gradient-to-r from-emerald-500/20 to-transparent"></span>
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Height" type="number" icon={<Ruler size={14} />} rightElement="cm" value={formData.height || ''} onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })} />
                                <Input label="Weight" type="number" icon={<Weight size={14} />} rightElement="kg" value={formData.weight || ''} onChange={e => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[11px] uppercase tracking-widest font-bold text-purple-500 mb-6 flex items-center gap-3">
                                <span className="w-6 h-[2px] bg-purple-500/50 rounded-full"></span>Contact & Family<span className="flex-1 h-[1px] bg-gradient-to-r from-purple-500/20 to-transparent"></span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input className="md:col-span-2" label="Player's Phone" value={formData.playerPhone} onChange={e => setFormData({ ...formData, playerPhone: e.target.value })} placeholder="+1 (555) 000-0000" />
                                <Input label="Mother's Name" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} />
                                <Input label="Mother's Phone" value={formData.motherPhone} onChange={e => setFormData({ ...formData, motherPhone: e.target.value })} />
                                <Input label="Father's Name" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                                <Input label="Father's Phone" value={formData.fatherPhone} onChange={e => setFormData({ ...formData, fatherPhone: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}