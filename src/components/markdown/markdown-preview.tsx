'use client';


import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
        'prose-code:text-sm',
        'prose-pre:bg-transparent prose-pre:p-0',
        'prose-ul:list-disc prose-ol:list-decimal',
        'prose-li:marker:text-muted-foreground',
        className
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, node, ref, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            
            if (!isInline && match) {
              return (
                <SyntaxHighlighter
                  style={vscDarkPlus as any}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg !mt-0"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }

            return (
              <code className={cn("bg-muted px-1.5 py-0.5 rounded font-mono text-sm", className)} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
