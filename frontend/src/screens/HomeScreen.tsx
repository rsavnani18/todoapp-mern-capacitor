import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  CheckSquare,
  Plus,
  Search,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import type {
  ChecklistItem,
  Note,
  NoteColor,
  NoteType,
  Todo,
  TodoPriority,
} from '../types';
import { noteApi, todoApi } from '../services/api';
import { nativeHaptics, nativeNotifications } from '../services/capacitor';
import { Header } from '../components/Header';
import { TodoCard } from '../components/TodoCard';
import { TodoSheet } from '../components/TodoSheet';
import { NoteCard } from '../components/NoteCard';
import { NoteEditorSheet } from '../components/NoteEditorSheet';
import { SkeletonList } from '../components/SkeletonList';
import { cn } from '../lib/cn';

interface HomeScreenProps {
  onOpenProfile: () => void;
  onModalStateChange: (isOpen: boolean) => void;
}

type WorkspaceSection = 'tasks' | 'notes';
type TodoFilter = 'all' | 'active' | 'completed';
type NoteViewMode = 'active' | 'archived' | 'trashed';

export function HomeScreen({
  onOpenProfile,
  onModalStateChange,
}: HomeScreenProps) {
  const [section, setSection] = useState<WorkspaceSection>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  // Tasks State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('all');
  const [todoSort, setTodoSort] = useState<'newest' | 'dueDate'>('newest');
  const [todoSheetOpen, setTodoSheetOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Notes State (Google Keep Style)
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [noteView, setNoteView] = useState<NoteViewMode>('active');
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // Sync open modal state with App.tsx hardware back-button handler
  useEffect(() => {
    onModalStateChange(todoSheetOpen || noteSheetOpen);
  }, [todoSheetOpen, noteSheetOpen, onModalStateChange]);

  /* ==================== FETCH DATA ==================== */
  const fetchTodos = useCallback(async () => {
    setTodosLoading(true);
    try {
      const res = await todoApi.getAll({
        search: searchQuery || undefined,
        sort: todoSort,
      });
      setTodos(res.todos);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setTodosLoading(false);
    }
  }, [searchQuery, todoSort, showToast]);

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const res = await noteApi.getAll({
        search: searchQuery || undefined,
        label: noteView === 'active' && selectedLabel ? selectedLabel : undefined,
        archived: noteView === 'archived',
        trashed: noteView === 'trashed',
      });
      setNotes(res.notes);
      setAvailableLabels(res.availableLabels);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setNotesLoading(false);
    }
  }, [searchQuery, selectedLabel, noteView, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (section === 'tasks') {
        fetchTodos();
      } else {
        fetchNotes();
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [section, fetchTodos, fetchNotes]);

  /* ==================== TASK HANDLERS ==================== */
  const filteredTodos = useMemo(() => {
    if (todoFilter === 'active') return todos.filter((t) => !t.completed);
    if (todoFilter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  }, [todos, todoFilter]);

  const pendingCount = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );

  const handleSaveTodo = async (payload: {
    title: string;
    description?: string | null;
    priority: TodoPriority;
    dueDate?: string | null;
  }) => {
    if (editingTodo) {
      const res = await todoApi.update(editingTodo._id, payload);
      setTodos((prev) =>
        prev.map((t) => (t._id === editingTodo._id ? res.todo : t))
      );
      if (res.todo.dueDate && !res.todo.completed) {
        await nativeNotifications.scheduleReminder({
          id: res.todo._id,
          title: `Task Due Soon: ${res.todo.title}`,
          body: res.todo.description || 'Tap to view task',
          targetDateIso: res.todo.dueDate,
          kind: 'todo',
        });
      } else {
        await nativeNotifications.cancelReminder(res.todo._id, 'todo');
      }
      showToast('Task updated');
    } else {
      const res = await todoApi.create({
        title: payload.title,
        description: payload.description || undefined,
        priority: payload.priority,
        dueDate: payload.dueDate || undefined,
      });
      setTodos((prev) => [res.todo, ...prev]);
      if (res.todo.dueDate) {
        await nativeNotifications.scheduleReminder({
          id: res.todo._id,
          title: `Task Due Soon: ${res.todo.title}`,
          body: res.todo.description || 'Tap to view task',
          targetDateIso: res.todo.dueDate,
          kind: 'todo',
        });
      }
      showToast('Task created');
    }
    nativeHaptics.success();
  };

  const handleToggleTodoComplete = async (todo: Todo) => {
    const nextCompleted = !todo.completed;
    setTodos((prev) =>
      prev.map((t) =>
        t._id === todo._id ? { ...t, completed: nextCompleted } : t
      )
    );
    try {
      const res = await todoApi.update(todo._id, { completed: nextCompleted });
      setTodos((prev) =>
        prev.map((t) => (t._id === todo._id ? res.todo : t))
      );
      if (nextCompleted) {
        await nativeNotifications.cancelReminder(todo._id, 'todo');
      } else if (res.todo.dueDate) {
        await nativeNotifications.scheduleReminder({
          id: res.todo._id,
          title: `Task Due Soon: ${res.todo.title}`,
          body: res.todo.description || 'Tap to view task',
          targetDateIso: res.todo.dueDate,
          kind: 'todo',
        });
      }
    } catch {
      fetchTodos();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t._id !== id));
    await nativeNotifications.cancelReminder(id, 'todo');
    try {
      await todoApi.delete(id);
      showToast('Task deleted');
    } catch {
      fetchTodos();
    }
  };

  const handleConvertTodoToNote = async (todo: Todo) => {
    try {
      await todoApi.convertToNote(todo._id);
      showToast('Saved to Keep Notes');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Conversion failed');
    }
  };

  /* ==================== KEEP NOTES HANDLERS ==================== */
  const pinnedNotes = useMemo(
    () => (noteView === 'active' ? notes.filter((n) => n.isPinned) : []),
    [notes, noteView]
  );

  const otherNotes = useMemo(
    () => (noteView === 'active' ? notes.filter((n) => !n.isPinned) : notes),
    [notes, noteView]
  );

  const handleSaveNote = async (payload: {
    title: string;
    content: string;
    type: NoteType;
    checklist: ChecklistItem[];
    color: NoteColor;
    isPinned: boolean;
    labels: string[];
    reminderAt?: string | null;
  }) => {
    if (editingNote) {
      const res = await noteApi.update(editingNote._id, payload);
      setNotes((prev) =>
        prev.map((n) => (n._id === editingNote._id ? res.note : n))
      );
      if (res.note.reminderAt && !res.note.isTrashed) {
        await nativeNotifications.scheduleReminder({
          id: res.note._id,
          title: res.note.title || 'Note Reminder',
          body: res.note.content || 'Tap to open note',
          targetDateIso: res.note.reminderAt,
          kind: 'note',
        });
      } else {
        await nativeNotifications.cancelReminder(res.note._id, 'note');
      }
      showToast('Note saved');
    } else {
      const res = await noteApi.create({
        ...payload,
        reminderAt: payload.reminderAt || undefined,
      });
      if (noteView === 'active') {
        setNotes((prev) => [res.note, ...prev]);
      } else {
        setNoteView('active');
      }
      if (res.note.reminderAt) {
        await nativeNotifications.scheduleReminder({
          id: res.note._id,
          title: res.note.title || 'Note Reminder',
          body: res.note.content || 'Tap to open note',
          targetDateIso: res.note.reminderAt,
          kind: 'note',
        });
      }
      showToast('Note created');
    }
    fetchNotes();
    nativeHaptics.success();
  };

  const handleToggleNotePin = async (note: Note) => {
    const nextPin = !note.isPinned;
    try {
      await noteApi.update(note._id, { isPinned: nextPin });
      fetchNotes();
      showToast(nextPin ? 'Note pinned' : 'Note unpinned');
    } catch {
      fetchNotes();
    }
  };

  const handleToggleNoteArchive = async (note: Note) => {
    const nextArchive = !note.isArchived;
    setNotes((prev) => prev.filter((n) => n._id !== note._id));
    try {
      await noteApi.update(note._id, { isArchived: nextArchive });
      showToast(nextArchive ? 'Note archived' : 'Note unarchived');
    } catch {
      fetchNotes();
    }
  };

  const handleTrashOrRestoreNote = async (note: Note) => {
    const nextTrash = !note.isTrashed;
    setNotes((prev) => prev.filter((n) => n._id !== note._id));
    if (nextTrash) {
      await nativeNotifications.cancelReminder(note._id, 'note');
    }
    try {
      await noteApi.update(note._id, { isTrashed: nextTrash });
      showToast(nextTrash ? 'Moved to Trash' : 'Note restored');
    } catch {
      fetchNotes();
    }
  };

  const handleDeleteNotePermanent = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n._id !== id));
    try {
      await noteApi.deletePermanent(id);
      showToast('Deleted permanently');
    } catch {
      fetchNotes();
    }
  };

  const handleEmptyTrash = async () => {
    if (notes.length === 0) return;
    try {
      await noteApi.emptyTrash();
      setNotes([]);
      showToast('Trash emptied');
    } catch {
      fetchNotes();
    }
  };

  const handleToggleChecklistItem = async (
    noteId: string,
    itemId: string,
    nextChecked: boolean
  ) => {
    // Optimistic UI update
    setNotes((prev) =>
      prev.map((n) =>
        n._id === noteId
          ? {
              ...n,
              checklist: n.checklist.map((it) =>
                it._id === itemId ? { ...it, isChecked: nextChecked } : it
              ),
            }
          : n
      )
    );
    try {
      const res = await noteApi.toggleChecklistItem(
        noteId,
        itemId,
        nextChecked
      );
      setNotes((prev) =>
        prev.map((n) => (n._id === noteId ? res.note : n))
      );
    } catch {
      fetchNotes();
    }
  };

  const handleConvertNoteToTodos = async (note: Note) => {
    try {
      const res = await noteApi.convertToTodos(note._id);
      showToast(
        `Created ${res.count} task${res.count > 1 ? 's' : ''} from note`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Conversion failed');
    }
  };

  const renderNoteGrid = (list: Note[]) => (
    <div className="columns-2 gap-3">
      {list.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onEdit={(n) => {
            setEditingNote(n);
            setNoteSheetOpen(true);
          }}
          onTogglePin={handleToggleNotePin}
          onToggleArchive={handleToggleNoteArchive}
          onTrashOrRestore={handleTrashOrRestoreNote}
          onDeletePermanent={handleDeleteNotePermanent}
          onToggleChecklistItem={handleToggleChecklistItem}
          onConvertToTodos={handleConvertNoteToTodos}
        />
      ))}
    </div>
  );

  return (
    <div className="flex-1 pt-safe pb-28 px-4.5 flex flex-col gap-3.5">
      <Header onOpenProfile={onOpenProfile} />

      {/* Search Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-text-secondary absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder={
            section === 'tasks'
              ? 'Search tasks...'
              : 'Search notes, checklists, #labels...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-9 rounded-2xl bg-bg-secondary border border-border-subtle text-sm focus:border-accent outline-none transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="w-6 h-6 rounded-full bg-bg-elevated text-text-secondary flex items-center justify-center absolute right-2.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Section Controls (Tasks Filter Bar OR Keep Notes Filter Bar) */}
      {section === 'tasks' ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {(['all', 'active', 'completed'] as TodoFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTodoFilter(tab)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize border transition',
                  todoFilter === tab
                    ? 'bg-accent-soft text-accent-text border-accent-border'
                    : 'bg-bg-secondary text-text-secondary border-border-subtle'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setTodoSort((s) => (s === 'newest' ? 'dueDate' : 'newest'))
            }
            className={cn(
              'px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition',
              todoSort === 'dueDate'
                ? 'bg-accent-soft text-accent-text border-accent-border'
                : 'bg-bg-secondary text-text-secondary border-border-subtle'
            )}
          >
            {todoSort === 'dueDate' ? 'Sort: Due Date' : 'Sort: Latest'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Keep Views: Notes / Archive / Trash */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setNoteView('active')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition',
                  noteView === 'active'
                    ? 'bg-accent-soft text-accent-text border-accent-border'
                    : 'bg-bg-secondary text-text-secondary border-border-subtle'
                )}
              >
                <StickyNote className="w-3.5 h-3.5" />
                <span>Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setNoteView('archived')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition',
                  noteView === 'archived'
                    ? 'bg-accent-soft text-accent-text border-accent-border'
                    : 'bg-bg-secondary text-text-secondary border-border-subtle'
                )}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>

              <button
                type="button"
                onClick={() => setNoteView('trashed')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition',
                  noteView === 'trashed'
                    ? 'bg-danger-bg text-danger border-danger-border'
                    : 'bg-bg-secondary text-text-secondary border-border-subtle'
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Trash</span>
              </button>
            </div>

            {noteView === 'trashed' && notes.length > 0 && (
              <button
                type="button"
                onClick={handleEmptyTrash}
                className="px-2.5 py-1 rounded-lg bg-danger-bg text-danger text-[11px] font-bold"
              >
                Empty
              </button>
            )}
          </div>

          {/* Horizontal Label Chips (Only in Active Notes View) */}
          {noteView === 'active' && availableLabels.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setSelectedLabel('')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition',
                  selectedLabel === ''
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-bg-secondary border border-border-subtle text-text-secondary'
                )}
              >
                All Labels
              </button>
              {availableLabels.map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() =>
                    setSelectedLabel((cur) => (cur === lbl ? '' : lbl))
                  }
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition',
                    selectedLabel === lbl
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-bg-secondary border border-border-subtle text-text-secondary'
                  )}
                >
                  #{lbl}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {section === 'tasks' ? (
          todosLoading ? (
            <SkeletonList />
          ) : filteredTodos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 gap-2">
              <div className="w-13 h-13 rounded-2xl bg-bg-secondary border border-border-subtle flex items-center justify-center text-accent-text mb-1">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">No tasks found</h3>
              <p className="text-xs text-text-secondary max-w-[240px]">
                Tap the + button below to create a new task with priority and
                reminders.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredTodos.map((todo) => (
                <TodoCard
                  key={todo._id}
                  todo={todo}
                  onToggleComplete={handleToggleTodoComplete}
                  onEdit={(t) => {
                    setEditingTodo(t);
                    setTodoSheetOpen(true);
                  }}
                  onDelete={handleDeleteTodo}
                  onConvertToNote={handleConvertTodoToNote}
                />
              ))}
            </div>
          )
        ) : notesLoading ? (
          <SkeletonList />
        ) : notes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 gap-2">
            <div className="w-13 h-13 rounded-2xl bg-bg-secondary border border-border-subtle flex items-center justify-center text-accent-text mb-1">
              <StickyNote className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">
              {noteView === 'trashed'
                ? 'Trash is empty'
                : noteView === 'archived'
                  ? 'No archived notes'
                  : 'No notes yet'}
            </h3>
            <p className="text-xs text-text-secondary max-w-[250px]">
              {noteView === 'active'
                ? 'Capture ideas, checklists, and color-coded notes just like Google Keep.'
                : 'Notes you move here will appear in this section.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pinnedNotes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-1">
                  Pinned
                </span>
                {renderNoteGrid(pinnedNotes)}
              </div>
            )}

            {otherNotes.length > 0 && (
              <div className="flex flex-col gap-2">
                {pinnedNotes.length > 0 && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-1">
                    Others
                  </span>
                )}
                {renderNoteGrid(otherNotes)}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-22 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-text-primary text-bg-primary text-xs font-semibold shadow-lg animate-slide-up whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Bottom Dock: Unified Tasks / Keep Notes Switcher + Context-Aware FAB */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4.5 pt-3 pb-safe bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent flex items-center justify-between gap-3 pointer-events-none z-30">
        {/* Segmented Bottom Switcher */}
        <div className="pointer-events-auto flex items-center p-1 rounded-full bg-bg-secondary border border-border-subtle shadow-md">
          <button
            type="button"
            onClick={() => {
              nativeHaptics.light();
              setSection('tasks');
            }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition',
              section === 'tasks'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks</span>
            {pendingCount > 0 && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-extrabold',
                  section === 'tasks'
                    ? 'bg-white/20 text-white'
                    : 'bg-bg-elevated text-text-secondary'
                )}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              nativeHaptics.light();
              setSection('notes');
            }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition',
              section === 'notes'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>
        </div>

        {/* Dynamic FAB */}
        <button
          type="button"
          onClick={() => {
            nativeHaptics.medium();
            if (section === 'tasks') {
              setEditingTodo(null);
              setTodoSheetOpen(true);
            } else {
              setEditingNote(null);
              setNoteSheetOpen(true);
            }
          }}
          className="pointer-events-auto inline-flex items-center gap-1.5 h-12 px-5 rounded-full bg-accent hover:bg-accent-hover text-accent-foreground text-xs font-bold shadow-lg shadow-violet-600/30 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{section === 'tasks' ? 'Task' : 'Note'}</span>
        </button>
      </div>

      {/* Bottom Sheet Modals */}
      <TodoSheet
        open={todoSheetOpen}
        editingTodo={editingTodo}
        onClose={() => setTodoSheetOpen(false)}
        onSave={handleSaveTodo}
      />

      <NoteEditorSheet
        open={noteSheetOpen}
        editingNote={editingNote}
        availableLabels={availableLabels}
        onClose={() => setNoteSheetOpen(false)}
        onSave={handleSaveNote}
      />
    </div>
  );
}
