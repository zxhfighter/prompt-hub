'use client';

import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <p className="text-muted-foreground">预览内容将在这里显示...</p>
    );
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-h1:text-xl prose-h2:text-lg prose-h3:text-base',
        'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        'prose-pre:bg-muted prose-pre:text-sm',
        'prose-ul:list-disc prose-ol:list-decimal',
        'prose-li:marker:text-muted-foreground',
        className
      )}
    >
      <Markdown>{content}</Markdown>
    </div>
  );
}
