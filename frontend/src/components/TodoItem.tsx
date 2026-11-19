import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!todo.dueDate || todo.completed) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, [todo.dueDate, todo.completed]);

  const isUrgent = Boolean(
    todo.dueDate &&
    !todo.completed &&
    new Date(todo.dueDate).getTime() - now <= 15 * 60 * 1000
  );

  const formattedDateTime = todo.dueDate
    ? new Date(todo.dueDate).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <div
      className={`todo-card ${todo.completed ? 'completed' : ''} ${
        isUrgent ? 'urgent-red' : ''
      }`}
    >
      <button
        type="button"
        className="check-btn"
        onClick={() => onToggle(todo)}
        aria-label="Toggle task completion"
      >
        {todo.completed ? (
          <CheckCircle2 size={22} className="icon-checked" />
        ) : (
          <Circle
            size={22}
            className={isUrgent ? 'icon-urgent' : 'icon-unchecked'}
          />
        )}
      </button>

      <div className="todo-content" onClick={() => onEdit(todo)}>
        <div className="todo-title-row">
          <span className="todo-title">{todo.title}</span>
        </div>

        {todo.description && <p className="todo-desc">{todo.description}</p>}

        <div className="todo-meta">
          <span className={`priority-pill priority-${todo.priority}`}>
            {todo.priority}
          </span>
          {formattedDateTime && (
            <span className={`due-badge ${isUrgent ? 'due-urgent' : ''}`}>
              {isUrgent ? <AlertCircle size={12} /> : <Clock size={12} />}
              {formattedDateTime}
            </span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onEdit(todo)}
          aria-label="Edit task"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => onDelete(todo._id)}
          aria-label="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
