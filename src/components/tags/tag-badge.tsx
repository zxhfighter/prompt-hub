import { cn } from '@/lib/utils';
import type { Tag } from '@/types';

interface TagBadgeProps {
  tag: Tag;
  className?: string;
  onRemove?: () => void;
}

export function TagBadge({ tag, className, onRemove }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      style={{ 
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`,
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:opacity-70"
        >
          ×
        </button>
      )}
    </span>
  );
}
