import { useState, useEffect } from 'react';
import { Bug, Lightbulb, HelpCircle, Send, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import {
  FeedbackService,
  FeedbackRequest,
  FeedbackType,
} from '../services/feedback-service';

const TYPE_OPTIONS = [
  { label: 'Bug report',    value: 'bug' },
  { label: 'Feature request', value: 'feature' },
  { label: 'Question',      value: 'question' },
];

const TYPE_META: Record<FeedbackType, { label: string; icon: any; classes: string }> = {
  bug:      { label: 'Bug',      icon: Bug,         classes: 'bg-rose-500/10 text-rose-600' },
  feature:  { label: 'Feature',  icon: Lightbulb,   classes: 'bg-amber-500/10 text-amber-600' },
  question: { label: 'Question', icon: HelpCircle,  classes: 'bg-blue-500/10 text-blue-600' },
};

const STATUS_META: Record<string, { label: string; classes: string }> = {
  new:         { label: 'New',         classes: 'bg-slate-500/10 text-slate-600' },
  in_progress: { label: 'In progress', classes: 'bg-amber-500/10 text-amber-600' },
  resolved:    { label: 'Resolved',    classes: 'bg-emerald-500/10 text-emerald-600' },
};

export default function FeedbackView() {
  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState<FeedbackRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await FeedbackService.getAll();
      setItems(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await FeedbackService.create({ type, title: title.trim(), description: description.trim() });
      setItems(prev => [created, ...prev]);
      setTitle('');
      setDescription('');
      setType('bug');
      toast.success('Thanks — feedback received');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="h-full w-full flex flex-col p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto overflow-y-auto custom-scrollbar gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-10 rounded-full bg-primary flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Feedback</h1>
          <p className="text-sm text-muted mt-0.5">
            Report bugs, request features, or ask a question.
          </p>
        </div>
      </div>

      {/* Submit form */}
      <Card className="p-6 flex-shrink-0">
        <h2 className="text-base font-semibold text-foreground mb-4">Submit new feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Type"
                options={TYPE_OPTIONS}
                value={type}
                onChange={(v) => setType(v as FeedbackType)}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Title"
                placeholder="Short summary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={140}
                required
              />
            </div>
          </div>

          <div className="space-y-2 w-full">
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Steps to reproduce, the feature you have in mind, or your question…"
              rows={5}
              required
              className="w-full bg-surface-hover border border-border text-foreground rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-muted/60 focus:bg-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/10 hover:border-border resize-y"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={submitting} icon={<Send size={14} />}>
              Submit
            </Button>
          </div>
        </form>
      </Card>

      {/* Submitted items */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Your submissions</h2>

        {loading ? (
          <Card className="p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </Card>
        ) : items.length === 0 ? (
          <Card className="p-10 flex flex-col items-center justify-center text-center">
            <Inbox size={32} className="text-muted/40 mb-3" />
            <p className="text-sm text-muted">No feedback submitted yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const TypeIcon = TYPE_META[item.type]?.icon ?? HelpCircle;
              const typeMeta = TYPE_META[item.type];
              const statusMeta = STATUS_META[item.status] ?? STATUS_META.new;
              return (
                <Card key={item.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${typeMeta?.classes ?? ''}`}>
                      <TypeIcon size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${statusMeta.classes}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <span className="text-xs text-muted flex-shrink-0">{formatDate(item.created_at)}</span>
                      </div>
                      <p className="text-sm text-muted mt-1.5 whitespace-pre-wrap">{item.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
