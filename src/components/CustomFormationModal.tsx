import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Save, Info } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from 'sonner';
import { PositionSlot } from '../types/models';
import { FormationService } from '../services';

interface CustomFormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (formation: any) => void;
}

const INITIAL_SLOTS: PositionSlot[] = [
  { id: 'gk', position: 'GK', x: 50, y: 90 },
  { id: 'p2', position: 'DEF', x: 20, y: 75 },
  { id: 'p3', position: 'DEF', x: 40, y: 75 },
  { id: 'p4', position: 'DEF', x: 60, y: 75 },
  { id: 'p5', position: 'DEF', x: 80, y: 75 },
  { id: 'p6', position: 'MID', x: 25, y: 50 },
  { id: 'p7', position: 'MID', x: 50, y: 50 },
  { id: 'p8', position: 'MID', x: 75, y: 50 },
  { id: 'p9', position: 'FWD', x: 30, y: 25 },
  { id: 'p10', position: 'FWD', x: 50, y: 20 },
  { id: 'p11', position: 'FWD', x: 70, y: 25 },
];

export default function CustomFormationModal({ isOpen, onClose, onSuccess }: CustomFormationModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [slots, setSlots] = useState<PositionSlot[]>(INITIAL_SLOTS);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const pitchRef = useRef<HTMLDivElement>(null);



  const draggingSlotId = useRef<string | null>(null);

  const updateSlotPosition = (id: string, x: number, y: number) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (editingSlotId) return; // Don't drag while renaming
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    draggingSlotId.current = id;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingSlotId.current || !pitchRef.current) return;
    
    const rect = pitchRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const constrainedX = Math.max(5, Math.min(95, x));
    const constrainedY = Math.max(5, Math.min(95, y));
    
    updateSlotPosition(draggingSlotId.current, constrainedX, constrainedY);
  };

  const handlePointerUp = () => {
    draggingSlotId.current = null;
  };

  const handleRenameSlot = (id: string, newPosition: string) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, position: newPosition } : s));
    setEditingSlotId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t('libraries.enterFormationNameToast'));
      return;
    }

    setIsSaving(true);
    try {
      const result = await FormationService.create(name, slots);
      toast.success(t('libraries.formationSavedToast'));
      onSuccess(result);
      onClose();
    } catch (error) {
      toast.error(t('libraries.formationSaveFailedToast'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('libraries.customFormation')} maxWidth="max-w-4xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-6">
          <Input 
            label={t('libraries.formationNameLabel')} 
            placeholder={t('libraries.formationNamePlaceholder')} 
            value={name} 
            onChange={(e) => setName(e.target.value)}
          />
          
          <div className="bg-surface-raised p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Info size={16} />
              <p className="text-xs font-bold uppercase tracking-widest">{t('libraries.instructionsLabel')}</p>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t('libraries.instructionsText')}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">{t('libraries.playerSlotsLabel')}</p>
            <div className="grid grid-cols-2 gap-2">
              {slots.map(slot => (
                <div key={slot.id} className="bg-surface border border-border rounded-lg p-2 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-foreground">{slot.position}</span>
                   <span className="text-[10px] text-muted font-mono">{Math.round(slot.x)},{Math.round(slot.y)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button onClick={handleSave} isLoading={isSaving} className="w-full" icon={<Save size={18} />}>
              {t('libraries.saveFormationBtn')}
            </Button>
            <Button onClick={onClose} variant="ghost" className="w-full">
              {t('common.cancel')}
            </Button>
          </div>
        </div>

        {/* Pitch Area */}
        <div className="flex-1">
          <div 
            ref={pitchRef}
            className="aspect-[3/4] bg-gradient-to-br from-emerald-900 to-emerald-950 border-2 border-emerald-800 rounded-2xl relative overflow-hidden shadow-2xl"
          >
            {/* Grass Lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 49px, #fff 50px)' }}></div>
            {/* Field Lines */}
            <div className="absolute inset-4 border-2 border-emerald-400/20 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-emerald-400/20 border-t-0 rounded-b-lg"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-emerald-400/20 border-b-0 rounded-t-lg"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0 border-t-2 border-emerald-400/20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-emerald-400/20 rounded-full"></div>
            </div>

            {/* Draggable Slots */}
            {slots.map((slot) => (
              <motion.div
                key={slot.id}
                onPointerDown={(e) => handlePointerDown(e, slot.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}

                onDoubleClick={() => {
                  setEditingSlotId(slot.id);
                  setEditLabel(slot.position);
                }}
                className="absolute w-12 h-12 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-full flex items-center justify-center cursor-move shadow-xl backdrop-blur-sm group z-10"
                style={{ 
                  left: `${slot.x}%`, 
                  top: `${slot.y}%`, 
                  transform: 'translate(-50%, -50%)',
                  touchAction: 'none' 
                }}
              >
                {editingSlotId === slot.id ? (
                  <input
                    autoFocus
                    className="w-10 bg-transparent text-[10px] font-bold text-white text-center border-none outline-none focus:ring-0 uppercase"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={() => handleRenameSlot(slot.id, editLabel)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSlot(slot.id, editLabel);
                      if (e.key === 'Escape') setEditingSlotId(null);
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white uppercase">{slot.position}</span>
                )}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
