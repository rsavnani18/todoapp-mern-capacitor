import {
  Archive,
  ArchiveRestore,
  Bell,
  CheckSquare,
  ListTodo,
  Pin,
  RotateCcw,
  Square,
  Trash2,
} from 'lucide-react';
import type { Note, NoteColor } from '../types';
import { cn } from '../lib/cn';
import { nativeHaptics } from '../services/capacitor';

export const NOTE_COLOR_CLASSES: Record<NoteColor, string> = {
  default: 'bg-note-default',
  cyan: 'bg-note-cyan',
  purple: 'bg-note-purple',
  amber: 'bg-note-amber',
  emerald: 'bg-note-emerald',
  rose: 'bg-note-rose',
  slate: 'bg-note-slate',
};

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
  onTrashOrRestore: (note: Note) => void;
  onDeletePermanent: (id: string) => void;
  onToggleChecklistItem: (
    noteId: string,
    itemId: string,
    nextChecked: boolean
  ) => void;
  onConvertToTodos: (note: Note) => void;
}

export function NoteCard({
  note,
  onEdit,
  onTogglePin,
  onToggleArchive,
  onTrashOrRestore,
  onDeletePermanent,
  onToggleChecklistItem,
  onConvertToTodos,
}: NoteCardProps) {
  const visibleChecklist = note.checklist.slice(0, 6);
  const remainingCount = Math.max(0, note.checklist.length - 6);

  return (
    <div
      onClick={() => onEdit(note)}
      className={cn(
        'break-inside-avoid mb-3 rounded-2xl border border-border-subtle p-3.5 flex flex-col gap-2.5 cursor-pointer transition-all active:scale-[0.99] shadow-2xs',
        NOTE_COLOR_CLASSES[note.color] || 'bg-note-default'
      )}
    >
      {/* Header: Title + Pin Button */}
      <div className="flex items-start justify-between gap-2">
        {note.title ? (
          <h3 className="text-[14.5px] font-bold leading-snug break-words flex-1">
            {note.title}
          </h3>
        ) : (
          <span className="flex-1" />
        )}

        {!note.isTrashed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nativeHaptics.light();
              onTogglePin(note);
            }}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition active:scale-90',
              note.isPinned
                ? 'bg-accent-soft text-accent-text'
                : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/10'
            )}
          >
            <Pin
              className={cn('w-3.5 h-3.5', note.isPinned && 'fill-current')}
            />
          </button>
        )}
      </div>

      {/* Body: Text Mode or Interactive Checklist Mode */}
      {note.type === 'checklist' && note.checklist.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {visibleChecklist.map((item, idx) => (
            <button
              key={item._id || idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!item._id || note.isTrashed) return;
                nativeHaptics.light();
                onToggleChecklistItem(note._id, item._id, !item.isChecked);
              }}
              className="flex items-start gap-2 text-left group py-0.5"
            >
              {item.isChecked ? (
                <CheckSquare className="w-4 h-4 text-accent-text shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-text-secondary shrink-0 mt-0.5" />
              )}
              <span
                className={cn(
                  'text-xs leading-snug break-words',
                  item.isChecked && 'line-through text-text-secondary opacity-70'
                )}
              >
                {item.text}
              </span>
            </button>
          ))}

          {remainingCount > 0 && (
            <span className="text-[11px] font-medium text-text-secondary pl-6">
              +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      ) : (
        note.content && (
          <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line line-clamp-6 break-words">
            {note.content}
          </p>
        )
      )}

      {/* Reminder & Label Chips */}
      {(note.reminderAt || note.labels.length > 0) && (
        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
          {note.reminderAt && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-accent-soft text-accent-text">
              <Bell className="w-2.5 h-2.5" />
              {new Date(note.reminderAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}

          {note.labels.slice(0, 3).map((lbl) => (
            <span
              key={lbl}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-text-secondary"
            >
              #{lbl}
            </span>
          ))}

          {note.labels.length > 3 && (
            <span className="text-[10px] font-semibold text-text-secondary">
              +{note.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Quick Action Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-end gap-1 pt-1 border-t border-black/5 dark:border-white/5"
      >
        {!note.isTrashed ? (
          <>
            <button
              type="button"
              onClick={() => {
                nativeHaptics.light();
                onConvertToTodos(note);
              }}
              title="Convert to Tasks"
              aria-label="Convert to Tasks"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-text hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition"
            >
              <ListTodo className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                nativeHaptics.light();
                onToggleArchive(note);
              }}
              title={note.isArchived ? 'Unarchive' : 'Archive'}
              aria-label={note.isArchived ? 'Unarchive' : 'Archive'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition"
            >
              {note.isArchived ? (
                <ArchiveRestore className="w-3.5 h-3.5" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                nativeHaptics.medium();
                onTrashOrRestore(note);
              }}
              title="Move to Trash"
              aria-label="Move to Trash"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger-bg active:scale-90 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                nativeHaptics.light();
                onTrashOrRestore(note);
              }}
              title="Restore Note"
              aria-label="Restore Note"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-success hover:bg-success-bg active:scale-90 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                nativeHaptics.medium();
                onDeletePermanent(note._id);
              }}
              title="Delete Forever"
              aria-label="Delete Forever"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-danger hover:bg-danger-bg active:scale-90 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
