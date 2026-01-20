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

interface PublishDialogProps {
  onConfirm: (description: string) => Promise<void>;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
}

export function PublishDialog({ 
  onConfirm, 
  trigger, 
  title = "发布版本",
  description = "请输入发布说明，记录本次更新的主要内容。",
  isSubmitting = false
}: PublishDialogProps) {
  const [open, setOpen] = useState(false);
  const [versionDesc, setVersionDesc] = useState('');

  const handleConfirm = async () => {
    await onConfirm(versionDesc);
    setOpen(false);
    setVersionDesc('');
  };

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">版本说明（可选）</Label>
            <Textarea
              id="description"
              placeholder="例如：优化了角色设定的描述..."
              value={versionDesc}
              onChange={(e) => setVersionDesc(e.target.value)}
              disabled={isSubmitting}
            />
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
