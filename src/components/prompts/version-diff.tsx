'use client';

import { cn } from '@/lib/utils';

interface VersionDiffProps {
  oldContent: string;
  newContent: string;
  oldVersion: number;
  newVersion: number;
  className?: string;
}

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: DiffLine[] = [];
  
  // Simple line-by-line diff (for production, use a proper diff algorithm)
  let oldIdx = 0;
  let newIdx = 0;
  
  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx];
    const newLine = newLines[newIdx];
    
    if (oldLine === newLine) {
      result.push({
        type: 'unchanged',
        content: oldLine || '',
        oldLineNum: oldIdx + 1,
        newLineNum: newIdx + 1,
      });
      oldIdx++;
      newIdx++;
    } else if (oldIdx < oldLines.length && !newLines.slice(newIdx).includes(oldLine)) {
      result.push({
        type: 'removed',
        content: oldLine,
        oldLineNum: oldIdx + 1,
      });
      oldIdx++;
    } else if (newIdx < newLines.length) {
      result.push({
        type: 'added',
        content: newLine,
        newLineNum: newIdx + 1,
      });
      newIdx++;
    } else {
      oldIdx++;
    }
  }
  
  return result;
}

export function VersionDiff({ oldContent, newContent, oldVersion, newVersion, className }: VersionDiffProps) {
  const diffLines = computeDiff(oldContent, newContent);
  
  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex border-b bg-muted/50">
        <div className="flex-1 px-4 py-2 text-sm font-medium border-r">
          V{oldVersion}
        </div>
        <div className="flex-1 px-4 py-2 text-sm font-medium">
          V{newVersion}
        </div>
      </div>
      
      {/* Diff content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {diffLines.map((line, i) => (
              <tr
                key={i}
                className={cn(
                  line.type === 'added' && 'bg-green-500/10',
                  line.type === 'removed' && 'bg-red-500/10'
                )}
              >
                {/* Old line number */}
                <td className="w-12 px-2 py-0.5 text-right text-muted-foreground select-none border-r">
                  {line.type !== 'added' ? line.oldLineNum : ''}
                </td>
                {/* New line number */}
                <td className="w-12 px-2 py-0.5 text-right text-muted-foreground select-none border-r">
                  {line.type !== 'removed' ? line.newLineNum : ''}
                </td>
                {/* Change indicator */}
                <td className="w-6 px-1 py-0.5 text-center select-none">
                  {line.type === 'added' && <span className="text-green-600">+</span>}
                  {line.type === 'removed' && <span className="text-red-600">-</span>}
                </td>
                {/* Content */}
                <td className="px-2 py-0.5 whitespace-pre">
                  <span className={cn(
                    line.type === 'added' && 'text-green-700 dark:text-green-400',
                    line.type === 'removed' && 'text-red-700 dark:text-red-400'
                  )}>
                    {line.content}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
