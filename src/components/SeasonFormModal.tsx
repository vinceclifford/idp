import { useState } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { SeasonService } from '../services/season-service';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export default function SeasonFormModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const { refreshSeasons, setActiveSeasonId } = useSeason();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Season name is required');
      return;
    }

    setLoading(true);
    try {
      const data = await SeasonService.create({ name });
      toast.success('Season created successfully');
      await refreshSeasons();
      setActiveSeasonId(data.id);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Season Name" 
          icon={<Calendar size={16} />} 
          placeholder="e.g. 2025/2026" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading}>Create Season</Button>
        </div>
      </form>
    </Modal>
  );
}
