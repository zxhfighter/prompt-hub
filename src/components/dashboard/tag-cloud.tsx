'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface TagWithCount {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface TagCloudProps {
  tags: TagWithCount[];
}

export function TagCloud({ tags }: TagCloudProps) {
  const maxCount = Math.max(...tags.map((t) => t.count), 0);
  const minCount = Math.min(...tags.map((t) => t.count), 0);

  // Helper to calculate size (1-3 scale)
  const getSize = (count: number) => {
    if (maxCount === minCount) return 'text-sm';
    const normalized = (count - minCount) / (maxCount - minCount);
    if (normalized > 0.6) return 'text-xl font-bold';
    if (normalized > 0.3) return 'text-lg font-semibold';
    return 'text-sm';
  };

  // Helper to calculate opacity/prominence
  const getOpacity = (count: number) => {
    if (maxCount === minCount) return 'opacity-100';
    const normalized = (count - minCount) / (maxCount - minCount);
    return 0.5 + (normalized * 0.5); // 0.5 to 1.0
  };

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          热门标签
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            暂无标签数据
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 items-center justify-center p-4 min-h-[140px]">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/dashboard/prompts?tags=${tag.id}`}
                className="transition-transform hover:scale-110"
              >
                <div
                  className={`
                    ${getSize(tag.count)} 
                    px-3 py-1.5 rounded-full cursor-pointer transition-colors
                    hover:opacity-80
                  `}
                  style={{
                    backgroundColor: tag.color,
                    color: '#fff', // Assuming tags potentially have dark execution colors, or we can use generic badges
                    opacity: getOpacity(tag.count),
                  }}
                >
                  {tag.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
