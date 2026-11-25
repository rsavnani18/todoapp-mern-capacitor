export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  _id: string;
  user: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteType = 'text' | 'checklist';

export type NoteColor =
  | 'default'
  | 'cyan'
  | 'purple'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'slate';

export interface ChecklistItem {
  _id?: string;
  text: string;
  isChecked: boolean;
}

export interface Note {
  _id: string;
  user: string;
  title: string;
  content: string;
  type: NoteType;
  checklist: ChecklistItem[];
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt?: string;
  labels: string[];
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
