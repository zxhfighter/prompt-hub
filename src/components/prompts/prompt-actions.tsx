'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiagnoseDialog } from '@/components/ai/diagnose-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PromptActionsProps {
  promptId: string;
  content: string;
}

export function PromptActions({ promptId, content }: PromptActionsProps) {
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('请输入 DELETE 确认删除');
      return;
    }
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      
      if (!response.ok) {
        throw new Error('删除失败');
      }
      
      toast.success('提示词已删除');
      window.location.href = '/dashboard/prompts';
    } catch {
      toast.error('删除失败');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy}>
        <Copy className="mr-2 h-4 w-4" />
        复制
      </Button>
      
      <DiagnoseDialog content={content} promptId={promptId} />
      
      <Button size="sm" asChild>
        <Link href={`/dashboard/prompts/${promptId}/edit`}>
          <Edit className="mr-2 h-4 w-4" />
          编辑
        </Link>
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除该提示词及其所有版本，且无法恢复。
              <br />
              请输入 <strong>DELETE</strong> 确认删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="输入 DELETE"
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm('')}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirm !== 'DELETE' || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
