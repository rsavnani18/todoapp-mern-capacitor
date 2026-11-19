import { CheckSquare } from 'lucide-react';

interface TaskProgressBadgeProps {
  completedCount: number;
  totalCount: number;
}

export function TaskProgressBadge({
  completedCount,
  totalCount,
}: TaskProgressBadgeProps) {
  return (
    <div className="dock-stat">
      <CheckSquare size={16} />
      <span>
        {completedCount}/{totalCount} done
      </span>
    </div>
  );
}
