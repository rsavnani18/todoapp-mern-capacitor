import { Search, Sparkles } from 'lucide-react';
import type { Todo } from '../types';
import { TaskSkeleton } from './TaskSkeleton';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  searchQuery: string;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoList({
  todos,
  loading,
  searchQuery,
  onToggle,
  onEdit,
  onDelete,
}: TodoListProps) {
  if (loading && todos.length === 0) {
    return <TaskSkeleton />;
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          {searchQuery ? <Search size={28} /> : <Sparkles size={28} />}
        </div>
        <h3>{searchQuery ? 'No matching tasks' : 'All caught up!'}</h3>
        <p>
          {searchQuery
            ? 'Try a different keyword'
            : 'Tap + New Task below to add your first task'}
        </p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo._id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
