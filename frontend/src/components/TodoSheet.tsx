import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Todo, TodoPriority } from '../types';

interface TodoSheetProps {
  isOpen: boolean;
  editingTodo: Todo | null;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description?: string;
    priority: TodoPriority;
    dueDate?: string | null;
  }) => Promise<void>;
}

function toLocalDateTimeInput(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function TodoSheet({
  isOpen,
  editingTodo,
  onClose,
  onSave,
}: TodoSheetProps) {
  const [title, setTitle] = useState(editingTodo?.title ?? '');
  const [description, setDescription] = useState(
    editingTodo?.description ?? ''
  );
  const [priority, setPriority] = useState<TodoPriority>(
    editingTodo?.priority ?? 'medium'
  );
  const [dueDateTime, setDueDateTime] = useState(() =>
    toLocalDateTimeInput(editingTodo?.dueDate)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDateTime ? new Date(dueDateTime).toISOString() : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{editingTodo ? 'Edit Task' : 'New Task'}</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sheet-form">
          {error && <div className="error-banner">{error}</div>}

          <label className="field-label">
            Task Title
            <input
              type="text"
              placeholder="e.g., Client call with team"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className="field-label">
            Notes (Optional)
            <textarea
              rows={2}
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="field-label">
            <span>Priority</span>
            <div className="priority-selector">
              {(['low', 'medium', 'high'] as TodoPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`prio-btn ${priority === p ? `active-${p}` : ''}`}
                  onClick={() => setPriority(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <label className="field-label">
            Due Date & Time
            <input
              type="datetime-local"
              value={dueDateTime}
              onChange={(e) => setDueDateTime(e.target.value)}
            />
          </label>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editingTodo ? 'Update Task' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
