import { Plus } from 'lucide-react';

interface NewTaskButtonProps {
  onClick: () => void;
}

export function NewTaskButton({ onClick }: NewTaskButtonProps) {
  return (
    <button
      type="button"
      className="fab-btn"
      onClick={onClick}
      aria-label="Add new task"
    >
      <Plus size={22} />
      <span>New Task</span>
    </button>
  );
}
