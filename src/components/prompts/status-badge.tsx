import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { PromptStatus } from '@/types';

interface StatusBadgeProps {
  status: PromptStatus;
  className?: string;
}

const statusConfig: Record<PromptStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: '草稿', variant: 'secondary' },
  published: { label: '已发布', variant: 'default' },
  published_with_updates: { label: '有更新', variant: 'outline' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant={config.variant}
      className={cn(
        status === 'published' && 'bg-green-600 hover:bg-green-700',
        status === 'published_with_updates' && 'border-orange-500 text-orange-600',
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
