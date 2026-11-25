import type {
  User,
  Todo,
  TodoPriority,
  Note,
  NoteType,
  NoteColor,
  ChecklistItem,
} from '../types';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

const TOKEN_KEY = 'todoapp_v2_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({
    success: false,
    message: 'Unexpected server response',
  }));

  if (!res.ok || data.success === false) {
    if (res.status === 401) {
      tokenStorage.clear();
    }
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data as T;
}

/* ==================== AUTH API ==================== */
export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ success: true; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ success: true; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<{ success: true; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request<{ success: true; user: User }>('/auth/me'),

  changePassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) =>
    request<{ success: true; message: string }>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

/* ==================== TODOS API ==================== */
export interface GetTodosParams {
  completed?: 'true' | 'false';
  priority?: TodoPriority;
  search?: string;
  sort?: 'newest' | 'oldest' | 'dueDate';
}

export const todoApi = {
  getAll: (params: GetTodosParams = {}) => {
    const qs = new URLSearchParams();
    if (params.completed) qs.set('completed', params.completed);
    if (params.priority) qs.set('priority', params.priority);
    if (params.search?.trim()) qs.set('search', params.search.trim());
    if (params.sort) qs.set('sort', params.sort);
    const query = qs.toString();
    return request<{ success: true; count: number; todos: Todo[] }>(
      `/todos${query ? `?${query}` : ''}`
    );
  },

  create: (payload: {
    title: string;
    description?: string;
    priority?: TodoPriority;
    dueDate?: string;
  }) =>
    request<{ success: true; todo: Todo }>('/todos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (
    id: string,
    payload: {
      title?: string;
      description?: string | null;
      completed?: boolean;
      priority?: TodoPriority;
      dueDate?: string | null;
    }
  ) =>
    request<{ success: true; todo: Todo }>(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ success: true; message: string }>(`/todos/${id}`, {
      method: 'DELETE',
    }),

  convertToNote: (id: string) =>
    request<{ success: true; note: Note }>(`/todos/${id}/convert-to-note`, {
      method: 'POST',
    }),
};

/* ==================== NOTES API (GOOGLE KEEP STYLE) ==================== */
export interface GetNotesParams {
  search?: string;
  label?: string;
  archived?: boolean;
  trashed?: boolean;
  pinned?: boolean;
  color?: NoteColor;
}

export const noteApi = {
  getAll: (params: GetNotesParams = {}) => {
    const qs = new URLSearchParams();
    if (params.search?.trim()) qs.set('search', params.search.trim());
    if (params.label) qs.set('label', params.label);
    if (params.archived) qs.set('archived', 'true');
    if (params.trashed) qs.set('trashed', 'true');
    if (params.pinned) qs.set('pinned', 'true');
    if (params.color) qs.set('color', params.color);
    const query = qs.toString();
    return request<{
      success: true;
      count: number;
      availableLabels: string[];
      notes: Note[];
    }>(`/notes${query ? `?${query}` : ''}`);
  },

  create: (payload: {
    title?: string;
    content?: string;
    type?: NoteType;
    checklist?: ChecklistItem[];
    color?: NoteColor;
    isPinned?: boolean;
    isArchived?: boolean;
    labels?: string[];
    reminderAt?: string;
  }) =>
    request<{ success: true; note: Note }>('/notes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (
    id: string,
    payload: {
      title?: string;
      content?: string;
      type?: NoteType;
      checklist?: ChecklistItem[];
      color?: NoteColor;
      isPinned?: boolean;
      isArchived?: boolean;
      isTrashed?: boolean;
      labels?: string[];
      reminderAt?: string | null;
    }
  ) =>
    request<{ success: true; note: Note }>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  toggleChecklistItem: (id: string, itemId: string, isChecked: boolean) =>
    request<{ success: true; note: Note }>(
      `/notes/${id}/checklist/${itemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isChecked }),
      }
    ),

  deletePermanent: (id: string) =>
    request<{ success: true; message: string }>(`/notes/${id}`, {
      method: 'DELETE',
    }),

  emptyTrash: () =>
    request<{ success: true; deletedCount: number; message: string }>(
      '/notes/trash/empty',
      {
        method: 'DELETE',
      }
    ),

  convertToTodos: (id: string) =>
    request<{ success: true; count: number; todos: Todo[] }>(
      `/notes/${id}/convert-to-todos`,
      {
        method: 'POST',
      }
    ),
};
