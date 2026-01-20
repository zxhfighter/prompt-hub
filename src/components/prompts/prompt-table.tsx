'use client';

import Link from 'next/link';
import { MoreHorizontal, Edit, Eye, Trash2, Copy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/prompts/status-badge';
import { TagBadge } from '@/components/tags/tag-badge';
import type { PromptListItem } from '@/types';

interface PromptTableProps {
  prompts: PromptListItem[];
  onDelete?: (id: string) => void;
  onCopy?: (id: string) => void;
}

export function PromptTable({ prompts, onDelete, onCopy }: PromptTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">提示词</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>标签</TableHead>
            <TableHead>版本</TableHead>
            <TableHead className="text-right">更新时间</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((prompt) => (
            <TableRow key={prompt.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/prompts/${prompt.id}`}
                  className="hover:underline"
                >
                  {prompt.title}
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadge status={prompt.status} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.slice(0, 3).map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                  {prompt.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground self-center">
                      +{prompt.tags.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {prompt.currentVersion ? (
                  <span className="font-mono text-sm text-muted-foreground">
                    V{prompt.currentVersion.versionNumber}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-sm">
                {new Intl.DateTimeFormat('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(prompt.updatedAt))}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">打开菜单</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/prompts/${prompt.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/prompts/${prompt.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopy?.(prompt.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      复制内容
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete?.(prompt.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
