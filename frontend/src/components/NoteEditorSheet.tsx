import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  AlignLeft,
  Bell,
  CheckSquare,
  Pin,
  Plus,
  Square,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import type {
  ChecklistItem,
  Note,
  NoteColor,
  NoteType,
} from '../types';
import { cn } from '../lib/cn';
import { NOTE_COLOR_CLASSES } from './NoteCard';
import { nativeHaptics } from '../services/capacitor';

const COLOR_OPTIONS: { id: NoteColor; swatchClass: string; label: string }[] = [
  { id: 'default', swatchClass: 'bg-bg-secondary border-border-strong', label: 'Default' },
  { id: 'purple', swatchClass: 'bg-purple-300 dark:bg-purple-800', label: 'Purple' },
  { id: 'cyan', swatchClass: 'bg-cyan-300 dark:bg-cyan-800', label: 'Cyan' },
  { id: 'amber', swatchClass: 'bg-amber-300 dark:bg-amber-800', label: 'Amber' },
  { id: 'emerald', swatchClass: 'bg-emerald-300 dark:bg-emerald-800', label: 'Emerald' },
  { id: 'rose', swatchClass: 'bg-rose-300 dark:bg-rose-800', label: 'Rose' },
  { id: 'slate', swatchClass: 'bg-slate-300 dark:bg-slate-700', label: 'Slate' },
];

interface NoteEditorSheetProps {
  open: boolean;
  editingNote: Note | null;
  availableLabels: string[];
  onClose: () => void;
  onSave: (payload: {
    title: string;
    content: string;
    type: NoteType;
    checklist: ChecklistItem[];
    color: NoteColor;
    isPinned: boolean;
    labels: string[];
    reminderAt?: string | null;
  }) => Promise<void>;
}

function toLocalDatetimeInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NoteEditorSheet({
  open,
  editingNote,
  availableLabels,
  onClose,
  onSave,
}: NoteEditorSheetProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('text');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [isPinned, setIsPinned] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [reminderLocal, setReminderLocal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setNewItemText('');
    setLabelInput('');

    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setType(editingNote.type);
      setChecklist(editingNote.checklist || []);
      setColor(editingNote.color);
      setIsPinned(editingNote.isPinned);
      setLabels(editingNote.labels || []);
      setReminderLocal(toLocalDatetimeInput(editingNote.reminderAt));
    } else {
      setTitle('');
      setContent('');
      setType('text');
      setChecklist([]);
      setColor('default');
      setIsPinned(false);
      setLabels([]);
      setReminderLocal('');
    }
  }, [open, editingNote]);

  // Android hardware back-button support
  useEffect(() => {
    if (!open) return;
    const handleHardwareClose = () => onClose();
    window.addEventListener('app:close-modal', handleHardwareClose);
    return () =>
      window.removeEventListener('app:close-modal', handleHardwareClose);
  }, [open, onClose]);

  if (!open) return null;

  // Switch seamlessly between Text & Checklist like Google Keep
  const handleToggleMode = () => {
    nativeHaptics.light();
    if (type === 'text') {
      const lines = content
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      setChecklist(
        lines.length > 0
          ? lines.map((text) => ({ text, isChecked: false }))
          : [{ text: '', isChecked: false }]
      );
      setType('checklist');
    } else {
      const joined = checklist
        .map((item) => item.text.trim())
        .filter(Boolean)
        .join('\n');
      setContent(joined);
      setType('text');
    }
  };

  const handleAddChecklistItem = () => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    setChecklist((prev) => [...prev, { text: trimmed, isChecked: false }]);
    setNewItemText('');
  };

  const handleChecklistKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChecklistItem();
    }
  };

  const handleAddLabel = (raw?: string) => {
    const cleaned = (raw ?? labelInput).trim().toLowerCase().replace(/^#/, '');
    if (!cleaned) return;
    if (labels.length >= 10) {
      setError('Maximum 10 labels allowed');
      return;
    }
    if (!labels.includes(cleaned)) {
      setLabels((prev) => [...prev, cleaned]);
    }
    setLabelInput('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanChecklist = checklist
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);

    if (
      !title.trim() &&
      !content.trim() &&
      (type === 'text' || cleanChecklist.length === 0)
    ) {
      setError('Please enter a title, note content, or checklist item');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const isoReminder = reminderLocal
        ? new Date(reminderLocal).toISOString()
        : editingNote
          ? null
          : undefined;

      await onSave({
        title: title.trim(),
        content: content.trim(),
        type,
        checklist: type === 'checklist' ? cleanChecklist : [],
        color,
        isPinned,
        labels,
        reminderAt: isoReminder,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const suggestedLabels = availableLabels.filter((l) => !labels.includes(l));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-w-[480px] max-h-[90dvh] overflow-y-auto border-t border-border-subtle rounded-t-3xl px-5 pt-2.5 pb-safe animate-slide-up transition-colors',
          NOTE_COLOR_CLASSES[color] || 'bg-bg-secondary'
        )}
      >
        <div className="w-9 h-1 rounded-full bg-text-secondary/30 mx-auto mb-3" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">
              {editingNote ? 'Edit Note' : 'New Note'}
            </h2>
            <button
              type="button"
              onClick={handleToggleMode}
              title={
                type === 'text'
                  ? 'Convert to Checklist'
                  : 'Convert to Text Note'
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-semibold text-text-secondary hover:text-accent-text transition"
            >
              {type === 'text' ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Checklist</span>
                </>
              ) : (
                <>
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Text</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                nativeHaptics.light();
                setIsPinned((p) => !p);
              }}
              aria-label="Pin note"
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition',
                isPinned
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-black/5 dark:bg-white/10 text-text-secondary'
              )}
            >
              <Pin className={cn('w-4 h-4', isPinned && 'fill-current')} />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 text-text-secondary flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pb-2">
          {error && (
            <div className="px-3.5 py-2.5 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            maxLength={200}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border-subtle font-bold text-text-primary placeholder:text-text-secondary/70 focus:border-accent outline-none transition"
          />

          {/* Content OR Checklist Builder */}
          {type === 'text' ? (
            <textarea
              rows={5}
              maxLength={10000}
              placeholder="Take a note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus={!editingNote}
              className="w-full px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border-subtle text-text-primary placeholder:text-text-secondary/70 focus:border-accent outline-none resize-none transition leading-relaxed"
            />
          ) : (
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border-subtle">
              {checklist.map((item, idx) => (
                <div key={item._id || idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setChecklist((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, isChecked: !it.isChecked } : it
                        )
                      )
                    }
                    className="text-text-secondary hover:text-accent-text shrink-0"
                  >
                    {item.isChecked ? (
                      <CheckSquare className="w-4 h-4 text-accent-text" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <input
                    type="text"
                    maxLength={300}
                    value={item.text}
                    placeholder="List item..."
                    onChange={(e) =>
                      setChecklist((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, text: e.target.value } : it
                        )
                      )
                    }
                    className={cn(
                      'flex-1 bg-transparent text-sm outline-none border-b border-transparent focus:border-accent py-0.5',
                      item.isChecked && 'line-through text-text-secondary'
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setChecklist((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-text-secondary hover:text-danger p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add New List Item Row */}
              <div className="flex items-center gap-2 pt-1 border-t border-border-subtle">
                <Plus className="w-4 h-4 text-accent-text shrink-0" />
                <input
                  type="text"
                  maxLength={300}
                  placeholder="Add list item & press Enter..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={handleChecklistKeyDown}
                  className="flex-1 bg-transparent text-sm outline-none py-1"
                />
                {newItemText.trim() && (
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-2.5 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-bold"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Keep Color Palette Picker */}
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-semibold text-text-secondary">
              Card Color
            </span>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  title={opt.label}
                  onClick={() => {
                    nativeHaptics.light();
                    setColor(opt.id);
                  }}
                  className={cn(
                    'w-6 h-6 rounded-full border transition-transform',
                    opt.swatchClass,
                    color === opt.id
                      ? 'scale-125 ring-2 ring-accent ring-offset-1 ring-offset-bg-secondary'
                      : 'opacity-80 hover:opacity-100'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Labels Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Tag className="w-3.5 h-3.5 text-text-secondary absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  maxLength={30}
                  placeholder="Add label (e.g. work, ideas)"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                  className="w-full h-9 pl-8 pr-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border-subtle text-xs outline-none focus:border-accent"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddLabel()}
                className="h-9 px-3 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-bold text-text-secondary hover:text-accent-text"
              >
                Add
              </button>
            </div>

            {/* Active Labels */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-soft text-accent-text border border-accent-border text-[11px] font-semibold"
                  >
                    #{lbl}
                    <button
                      type="button"
                      onClick={() =>
                        setLabels((prev) => prev.filter((item) => item !== lbl))
                      }
                      className="hover:text-danger"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Suggested Labels */}
            {suggestedLabels.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] text-text-secondary shrink-0">
                  Existing:
                </span>
                {suggestedLabels.slice(0, 6).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => handleAddLabel(lbl)}
                    className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-medium text-text-secondary hover:text-accent-text shrink-0"
                  >
                    + #{lbl}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Optional Note Reminder */}
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            <span className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-accent-text" />
                Reminder (optional)
              </span>
              {reminderLocal && (
                <button
                  type="button"
                  onClick={() => setReminderLocal('')}
                  className="text-[11px] text-danger hover:underline"
                >
                  Clear
                </button>
              )}
            </span>
            <input
              type="datetime-local"
              value={reminderLocal}
              onChange={(e) => setReminderLocal(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-border-subtle text-text-primary focus:border-accent outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="h-12 mt-1 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground text-sm font-bold shadow-lg shadow-violet-600/20 active:scale-[0.98] disabled:opacity-60 transition"
          >
            {saving
              ? 'Saving...'
              : editingNote
                ? 'Save Note'
                : 'Create Note'}
          </button>
        </form>
      </div>
    </div>
  );
}
