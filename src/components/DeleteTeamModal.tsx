import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Team } from '../types/models';
import { TeamService } from '../services';
import { useTeam } from '../contexts/TeamContext';

interface DeleteTeamModalProps {
  team: Team | null;
  onClose: () => void;
}

/**
 * Type-the-team-name-to-confirm delete dialog. The exact-name match is what
 * makes accidental deletion effectively impossible — a stray click on the
 * trash button just opens a dialog that can't do anything until you
 * deliberately type the team's name.
 */
export default function DeleteTeamModal({ team, onClose }: DeleteTeamModalProps) {
  const { t } = useTranslation();
  const { refreshTeams } = useTeam();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset the typed confirmation whenever the target team changes.
  useEffect(() => { setConfirmText(''); }, [team?.id]);

  const canDelete = !!team && confirmText.trim() === team.name.trim();

  const handleDelete = async () => {
    if (!team || !canDelete || loading) return;
    setLoading(true);
    try {
      await TeamService.delete(team.id);
      await refreshTeams();
      toast.success(t('team.teamDeleted', { name: team.name }));
      onClose();
    } catch {
      toast.error(t('team.teamDeleteFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!team}
      onClose={onClose}
      title={t('team.deleteTeamTitle')}
      icon={<Trash2 size={20} className="text-rose-500" />}
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="ghost" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} disabled={!canDelete} isLoading={loading} className="flex-1">
            {t('team.deleteTeamConfirm')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-rose-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-rose-600 dark:text-rose-400 leading-relaxed">
            {t('team.deleteTeamWarning', { name: team?.name ?? '' })}
          </p>
        </div>
        <p className="text-sm text-muted">{t('team.deleteTeamPrompt')}</p>
        <Input
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder={team?.name ?? ''}
          autoFocus
        />
      </div>
    </Modal>
  );
}
