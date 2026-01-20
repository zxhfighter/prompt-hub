'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { VersionDiff } from '@/components/prompts/version-diff';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PublishDialogProps {
  onConfirm: (description: string) => Promise<void>;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
  currentContent: string;
  previousContent?: string | null;
  previousVersionNumber?: number;
}

export function PublishDialog({ 
  onConfirm, 
  trigger, 
  title = "发布版本",
  description = "请输入发布说明，记录本次更新的主要内容。",
  isSubmitting = false,
  currentContent,
  previousContent,
  previousVersionNumber = 0
}: PublishDialogProps) {
  const [open, setOpen] = useState(false);
  const [versionDesc, setVersionDesc] = useState('');

  const handleConfirm = async () => {
    await onConfirm(versionDesc);
    setOpen(false);
    setVersionDesc('');
  };

  const hasChanges = previousContent !== undefined && previousContent !== null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Send className="mr-2 h-4 w-4" />
            发布
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 py-4 overflow-hidden">
          {/* Form Side */}
          <div className="w-1/3 shrink-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">版本说明（可选）</Label>
              <Textarea
                id="description"
                placeholder="例如：优化了角色设定的描述..."
                value={versionDesc}
                onChange={(e) => setVersionDesc(e.target.value)}
                disabled={isSubmitting}
                className="h-[120px]"
              />
            </div>
            {hasChanges && (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md border">
                <p className="font-medium mb-1">变更概览</p>
                <p>即将发布 V{previousVersionNumber + 1}</p>
                <p>基于 V{previousVersionNumber}</p>
              </div>
            )}
            {!hasChanges && (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md border">
                <p className="font-medium mb-1">初始版本</p>
                <p>即将发布 V1</p>
              </div>
            )}
          </div>

          {/* Diff Side */}
          <div className="flex-1 min-w-0 flex flex-col h-[400px]">
             <Label className="mb-2">内容预览</Label>
             <ScrollArea className="flex-1 rounded-md border">
               {hasChanges ? (
                 <VersionDiff 
                   oldContent={previousContent || ''} 
                   newContent={currentContent} 
                   oldVersion={previousVersionNumber}
                   newVersion={previousVersionNumber + 1} 
                 />
               ) : (
                 <div className="p-4 font-mono text-sm whitespace-pre-wrap">
                   {currentContent}
                 </div>
               )}
             </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认发布
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
