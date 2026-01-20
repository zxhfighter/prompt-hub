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
import { Send, Loader2, Maximize2, X } from 'lucide-react';
import { VersionDiff } from '@/components/prompts/version-diff';

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
  const [showFullscreenDiff, setShowFullscreenDiff] = useState(false);
  const [versionDesc, setVersionDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onConfirm(versionDesc);
      setOpen(false);
      setVersionDesc('');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = previousContent !== undefined && previousContent !== null;
  const isBusy = isSubmitting || isLoading;

  const DiffView = ({ className = "" }: { className?: string }) => (
    hasChanges ? (
      <VersionDiff 
        oldContent={previousContent || ''} 
        newContent={currentContent} 
        oldVersion={previousVersionNumber}
        newVersion={previousVersionNumber + 1} 
        className={className}
      />
    ) : (
      <div className="p-4 font-mono text-sm whitespace-pre-wrap border rounded-md h-full overflow-auto">
        {currentContent}
      </div>
    )
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Send className="mr-2 h-4 w-4" />
              发布
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row gap-6 py-4 overflow-hidden flex-1 min-h-0">
            {/* Form Side */}
            <div className="w-full md:w-1/3 shrink-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">版本说明（可选）</Label>
                <Textarea
                  id="description"
                  placeholder="例如：优化了角色设定的描述..."
                  value={versionDesc}
                  onChange={(e) => setVersionDesc(e.target.value)}
                  disabled={isBusy}
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
            <div className="hidden md:flex flex-1 min-w-0 flex-col h-[400px]">
              <div className="flex items-center justify-between mb-2">
                 <Label>内容预览</Label>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowFullscreenDiff(true)}>
                   <Maximize2 className="h-4 w-4" />
                   <span className="sr-only">全屏查看</span>
                 </Button>
              </div>
              <div className="flex-1 rounded-md overflow-hidden bg-background">
                <div className="h-full overflow-y-auto border rounded-md">
                  <DiffView className="border-0 rounded-none h-full" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isBusy}>
              取消
            </Button>
            <Button onClick={handleConfirm} disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认发布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Diff Dialog */}
      <Dialog open={showFullscreenDiff} onOpenChange={setShowFullscreenDiff}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-4 sm:max-w-[95vw]">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <DialogTitle>版本对比预览</DialogTitle>
             {/* Close executed by onOpenChange via default X or escape */}
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto border rounded-md mt-2">
            <DiffView className="border-0 rounded-none min-h-full" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
