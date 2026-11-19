import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { native } from '../lib/native';
import type { Todo, TodoPriority } from '../types';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { TodoList } from '../components/TodoList';
import { GitHubBadge } from '../components/GitHubBadge';
import { TaskProgressBadge } from '../components/TaskProgressBadge';
import { NewTaskButton } from '../components/NewTaskButton';
import { TodoSheet } from '../components/TodoSheet';

type FilterTab = 'all' | 'pending' | 'completed';

interface HomeScreenProps {
  onOpenProfile: () => void;
}

export function HomeScreen({ onOpenProfile }: HomeScreenProps) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const loadTodos = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const params = new URLSearchParams();
      if (tab === 'pending') params.set('completed', 'false');
      if (tab === 'completed') params.set('completed', 'true');
      if (search.trim()) params.set('search', search.trim());

      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await apiFetch<{ success: true; todos: Todo[] }>(
        `/todos${query}`
      );
      setTodos(res.todos);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [user, tab, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTodos();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadTodos]);

  const handleSaveTodo = async (payload: {
    title: string;
    description?: string;
    priority: TodoPriority;
    dueDate?: string | null;
  }) => {
    if (editingTodo) {
      const res = await apiFetch<{ success: true; todo: Todo }>(
        `/todos/${editingTodo._id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );
      setTodos((prev) =>
        prev.map((t) => (t._id === res.todo._id ? res.todo : t))
      );
      await native.hapticSuccess();
      await native.scheduleTaskReminder(res.todo);
    } else {
      const res = await apiFetch<{ success: true; todo: Todo }>('/todos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setTodos((prev) => [res.todo, ...prev]);
      await native.hapticSuccess();
      await native.scheduleTaskReminder(res.todo);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    const optimistic = !todo.completed;
    native.hapticImpact('light');
    setTodos((prev) =>
      prev.map((t) =>
        t._id === todo._id ? { ...t, completed: optimistic } : t
      )
    );

    try {
      const res = await apiFetch<{ success: true; todo: Todo }>(
        `/todos/${todo._id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ completed: optimistic }),
        }
      );
      setTodos((prev) =>
        prev.map((t) => (t._id === res.todo._id ? res.todo : t))
      );
      await native.scheduleTaskReminder(res.todo);
    } catch {
      loadTodos();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    native.hapticWarning();
    setTodos((prev) => prev.filter((t) => t._id !== id));
    await native.cancelTaskReminder(id);
    try {
      await apiFetch(`/todos/${id}`, { method: 'DELETE' });
    } catch {
      loadTodos();
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard">
      <Header email={user.email} onOpenProfile={onOpenProfile} />

      <SearchBar value={search} onChange={setSearch} />

      <div className="filter-tabs">
        {(['all', 'pending', 'completed'] as FilterTab[]).map((item) => (
          <button
            key={item}
            type="button"
            className={`tab-chip ${tab === item ? 'active' : ''}`}
            onClick={() => {
              native.hapticImpact('light');
              setTab(item);
            }}
          >
            {item === 'all'
              ? 'All Tasks'
              : item === 'pending'
                ? 'Active'
                : 'Completed'}
          </button>
        ))}
      </div>

      <main className="main-scroll-area">
        <TodoList
          todos={todos}
          loading={fetching}
          searchQuery={search}
          onToggle={handleToggleTodo}
          onEdit={(item) => {
            setEditingTodo(item);
            setSheetOpen(true);
          }}
          onDelete={handleDeleteTodo}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '18px 0 8px',
          }}
        >
          <GitHubBadge />
        </div>
      </main>

      <div className="bottom-dock">
        <TaskProgressBadge
          completedCount={todos.filter((t) => t.completed).length}
          totalCount={todos.length}
        />
        <NewTaskButton
          onClick={() => {
            native.hapticImpact('medium');
            setEditingTodo(null);
            setSheetOpen(true);
          }}
        />
      </div>

      <TodoSheet
        key={sheetOpen ? (editingTodo?._id ?? 'create') : 'closed'}
        isOpen={sheetOpen}
        editingTodo={editingTodo}
        onClose={() => setSheetOpen(false)}
        onSave={handleSaveTodo}
      />
    </div>
  );
}
