import {
  Calendar,
  CheckCircle2,
  Circle,
  FilePlus2,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Todo } from '../types';
import { cn } from '../lib/cn';
import { nativeHaptics } from '../services/capacitor';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onConvertToNote: (todo: Todo) => void;
}

function formatDueDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TodoCard({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
  onConvertToNote,
}: TodoCardProps) {
  const isOverdue =
    !todo.completed &&
    Boolean(todo.dueDate) &&
    new Date(todo.dueDate!).getTime() < Date.now();

  const priorityStyles = {
    low: 'bg-success-bg text-success',
    medium: 'bg-warning-bg text-warning',
    high: 'bg-danger-bg text-danger',
  }[todo.priority];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle transition-all',
        isOverdue && 'bg-danger-bg border-danger-border',
        todo.completed && 'opacity-60'
      )}
    >
      <button
        type="button"
        onClick={() => {
          nativeHaptics.light();
          onToggleComplete(todo);
        }}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
        className="pt-0.5 shrink-0 active:scale-90 transition"
      >
        {todo.completed ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <Circle
            className={cn(
              'w-5 h-5',
              isOverdue ? 'text-danger' : 'text-text-secondary'
            )}
          />
        )}
      </button>

      <div
        onClick={() => onEdit(todo)}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <h3
          className={cn(
            'text-[15px] font-semibold leading-snug break-words',
            isOverdue && 'text-danger',
            todo.completed && 'line-through text-text-secondary'
          )}
        >
          {todo.title}
        </h3>

        {todo.description && (
          <p className="mt-1 text-xs text-text-secondary leading-relaxed line-clamp-2 break-words">
            {todo.description}
          </p>
        )}

        <div className="mt-2 flex items-center flex-wrap gap-2">
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
              priorityStyles
            )}
          >
            {todo.priority}
          </span>

          {todo.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary',
                isOverdue && 'text-danger font-bold'
              )}
            >
              <Calendar className="w-3 h-3" />
              {formatDueDate(todo.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            nativeHaptics.light();
            onConvertToNote(todo);
          }}
          title="Save as Keep Note"
          aria-label="Save as Keep Note"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-text hover:bg-accent-soft active:scale-90 transition"
        >
          <FilePlus2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onEdit(todo)}
          title="Edit task"
          aria-label="Edit task"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated active:scale-90 transition"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            nativeHaptics.medium();
            onDelete(todo._id);
          }}
          title="Delete task"
          aria-label="Delete task"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger-bg active:scale-90 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
