import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScoreRadar } from './score-radar';
import { MarkdownPreview } from '@/components/markdown/markdown-preview';
import type { DiagnoseResult } from '@/types';

interface DiagnoseDialogProps {
  content: string;
  promptId?: string;
  trigger?: React.ReactNode;
  onUpdateContent?: (content: string) => void;
}

export function DiagnoseDialog({ content, promptId, trigger, onUpdateContent }: DiagnoseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Optimization state
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState('');
  const [showOptimization, setShowOptimization] = useState(false);

  const handleDiagnose = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setShowOptimization(false);
    setOptimizedContent('');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, promptId }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || '诊断失败');
      }
      
      setResult(data.data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('请求超时，请检查网络或模型配置');
      } else {
        setError(err instanceof Error ? err.message : '诊断失败');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!result) return;
    
    setOptimizing(true);
    setShowOptimization(true);
    setOptimizedContent('');
    
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          suggestions: result.suggestions 
        }),
      });

      if (!response.ok) throw new Error('优化失败');
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('无法读取流');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setOptimizedContent(prev => prev + chunk);
      }
    } catch (error) {
      console.error('Optimization error:', error);
      // Ideally show error toast
    } finally {
      setOptimizing(false);
    }
  };

  const handleApply = () => {
    if (onUpdateContent && optimizedContent) {
      onUpdateContent(optimizedContent);
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !result && !loading) {
      handleDiagnose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            AI 诊断
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI 诊断报告</DialogTitle>
          <DialogDescription>
            基于多维度分析的提示词质量评估
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">正在分析...</p>
            </div>
          )}
          
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={handleDiagnose}
              >
                重试
              </Button>
            </div>
          )}
          
          {result && !loading && (
            <div className="space-y-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Overall Score */}
                <div className="text-center p-4 rounded-xl bg-accent/20 border">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {result.overallScore.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">综合评分</p>
                  <Progress 
                    value={result.overallScore * 10} 
                    className="mt-4 h-2 w-3/4 mx-auto"
                  />
                </div>
                
                {/* Radar Chart */}
                <div className="flex justify-center">
                  <ScoreRadar scores={result.scores} />
                </div>
              </div>
              
              <Separator />
              
              {/* Review Details Loop if needed, but keeping simple for now */}
              
              {/* Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">改进建议</h4>
                  {!showOptimization && onUpdateContent && (
                    <Button onClick={handleOptimize} size="sm">
                      <Sparkles className="mr-2 h-3.5 w-3.5" />
                      一键优化
                    </Button>
                  )}
                </div>
                <ul className="space-y-2 bg-muted/40 p-4 rounded-lg">
                  {result.suggestions.map((suggestion, i) => (
                    <li 
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Optimization Result */}
              {showOptimization && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Separator className="my-6" />
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      优化结果
                    </h4>
                    {optimizing ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        生成中...
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleOptimize}>
                          重新生成
                        </Button>
                        <Button size="sm" onClick={handleApply}>
                          <Check className="mr-2 h-4 w-4" />
                          应用
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="rounded-md border bg-muted/30 p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                    {optimizedContent ? (
                      <MarkdownPreview content={optimizedContent} />
                    ) : (
                      <div className="text-muted-foreground text-sm italic">
                        正在基于改进建议优化提示词...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
