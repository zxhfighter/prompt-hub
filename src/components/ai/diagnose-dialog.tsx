'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
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
import { ScoreRadar } from './score-radar';
import type { DiagnoseResult } from '@/types';

interface DiagnoseDialogProps {
  content: string;
  promptId?: string;
  trigger?: React.ReactNode;
}

export function DiagnoseDialog({ content, promptId, trigger }: DiagnoseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnose = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, promptId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || '诊断失败');
      }
      
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '诊断失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !result) {
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>AI 诊断报告</DialogTitle>
          <DialogDescription>
            基于多维度分析的提示词质量评估
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
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
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {result.overallScore.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">综合评分</p>
                <Progress 
                  value={result.overallScore * 10} 
                  className="mt-2 h-2"
                />
              </div>
              
              <Separator />
              
              {/* Radar Chart */}
              <ScoreRadar scores={result.scores} />
              
              <Separator />
              
              {/* Suggestions */}
              <div>
                <h4 className="font-semibold mb-3">改进建议</h4>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, i) => (
                    <li 
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
