import React, { useState } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { useTeam } from '../contexts/TeamContext';
import { SeasonService } from '../services/season-service';
import { TeamService } from '../services/team-service';
import { toast } from 'sonner';
import { Calendar, Copy } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export default function SeasonFormModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const { seasons, refreshSeasons, setActiveSeasonId } = useSeason();
  const { activeTeam } = useTeam();
  const [name, setName] = useState('');
  const [carryOverTeam, setCarryOverTeam] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Season name is required');
      return;
    }

    setLoading(true);
    try {
      // Check for duplicate season name
      const isDuplicate = seasons.some(s => s.name.toLowerCase() === name.trim().toLowerCase());
      if (isDuplicate) {
        toast.error(`A season named "${name}" already exists.`);
        setLoading(false);
        return;
      }

      const newSeason = await SeasonService.create({ name });
      
      if (carryOverTeam && activeTeam) {
        await TeamService.clone(activeTeam.id, newSeason.id);
      }

      toast.success('Season created successfully');
      await refreshSeasons();
      setActiveSeasonId(newSeason.id);
      
      setName('');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create season');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Season">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Season Name" 
          icon={<Calendar size={16} />} 
          placeholder="e.g. 2025/2026" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />

        {activeTeam && (
          <div className="bg-surface-raised/50 p-4 rounded-xl border border-border">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={carryOverTeam}
                  onChange={(e) => setCarryOverTeam(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 bg-surface"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Copy size={14} className="text-blue-400" />
                  Carry over "{activeTeam.name}" to this season
                </p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Automatically creates the same team and roster in the new season.
                </p>
              </div>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading}>Create Season</Button>
        </div>
      </form>
    </Modal>
  );
}
