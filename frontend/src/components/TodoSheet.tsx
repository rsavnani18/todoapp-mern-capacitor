import { useEffect, useState, type FormEvent } from 'react';
import { Calendar, X } from 'lucide-react';
import type { Todo, TodoPriority } from '../types';
import { cn } from '../lib/cn';

interface TodoSheetProps {
  open: boolean;
  editingTodo: Todo | null;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description?: string | null;
    priority: TodoPriority;
    dueDate?: string | null;
  }) => Promise<void>;
}

function toLocalDatetimeInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TodoSheet({
  open,
  editingTodo,
  onClose,
  onSave,
}: TodoSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDateLocal, setDueDateLocal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setPriority(editingTodo.priority);
      setDueDateLocal(toLocalDatetimeInput(editingTodo.dueDate));
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDateLocal('');
    }
  }, [open, editingTodo]);

  // Listen to Android hardware back button modal close event
  useEffect(() => {
    if (!open) return;
    const handleHardwareClose = () => onClose();
    window.addEventListener('app:close-modal', handleHardwareClose);
    return () =>
      window.removeEventListener('app:close-modal', handleHardwareClose);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const isoDueDate = dueDateLocal
        ? new Date(dueDateLocal).toISOString()
        : editingTodo
          ? null
          : undefined;

      await onSave({
        title: title.trim(),
        description: description.trim()
          ? description.trim()
          : editingTodo
            ? null
            : undefined,
        priority,
        dueDate: isoDueDate,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] bg-bg-secondary border-t border-border-subtle rounded-t-3xl px-5 pt-2.5 pb-safe animate-slide-up"
      >
        <div className="w-9 h-1 rounded-full bg-text-secondary/30 mx-auto mb-3" />

        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-lg font-bold">
            {editingTodo ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-bg-elevated text-text-secondary flex items-center justify-center active:scale-90 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pb-2">
          {error && (
            <div className="px-3.5 py-2.5 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-medium">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-secondary">
            <span>Title</span>
            <input
              type="text"
              maxLength={150}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="px-3 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary focus:border-accent outline-none transition"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-secondary">
            <span>Description (optional)</span>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="Add notes, links, or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary focus:border-accent outline-none resize-none transition"
            />
          </label>

          <div className="flex flex-col gap-1.5 text-xs font-semibold text-text-secondary">
            <span>Priority</span>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-bg-elevated border border-border-subtle">
              {(['low', 'medium', 'high'] as TodoPriority[]).map((level) => {
                const isSelected = priority === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    className={cn(
                      'py-2 rounded-lg text-xs font-bold capitalize transition',
                      !isSelected && 'text-text-secondary',
                      isSelected &&
                        level === 'low' &&
                        'bg-success-bg text-success',
                      isSelected &&
                        level === 'medium' &&
                        'bg-warning-bg text-warning',
                      isSelected &&
                        level === 'high' &&
                        'bg-danger-bg text-danger'
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-secondary">
            <span className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent-text" />
                Due Date & Reminder
              </span>
              {dueDateLocal && (
                <button
                  type="button"
                  onClick={() => setDueDateLocal('')}
                  className="text-[11px] text-danger hover:underline"
                >
                  Clear
                </button>
              )}
            </span>
            <input
              type="datetime-local"
              value={dueDateLocal}
              onChange={(e) => setDueDateLocal(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary focus:border-accent outline-none transition"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="h-12 mt-1 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground text-sm font-bold shadow-lg shadow-violet-600/20 active:scale-[0.98] disabled:opacity-60 transition"
          >
            {saving
              ? 'Saving...'
              : editingTodo
                ? 'Update Task'
                : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
