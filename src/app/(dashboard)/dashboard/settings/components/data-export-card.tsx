'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DataExportCard() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      // Fetch all prompts (limit 1000 for now)
      const response = await fetch('/api/prompts?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      const data = result.data;
      
      // Create JSON blob
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-hub-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('数据导出成功');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据管理</CardTitle>
        <CardDescription>导出所有提示词数据用于备份</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          导出所有数据 (JSON)
        </Button>
      </CardContent>
    </Card>
  );
}
