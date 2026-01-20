'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, GitCompare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Version {
  id: string;
  versionNumber: number;
  description: string | null;
  content: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function VersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  
  const fetchVersions = useCallback(async () => {
    try {
      const response = await fetch(`/api/prompts/${id}/versions`);
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      const result = await response.json();
      setVersions(result.data || []);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
      toast.error('获取版本历史失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);
  
  const toggleVersion = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(v => v !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleRestore = async (version: Version) => {
    try {
      // Update the prompt with this version's content as draft
      await fetch(`/api/prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: version.content }),
      });
      
      // Publish as new version
      await fetch(`/api/prompts/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: `恢复自 V${version.versionNumber}` }),
      });
      
      toast.success(`已恢复到版本 V${version.versionNumber}`);
      fetchVersions();
    } catch {
      toast.error('恢复失败');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/prompts/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">版本历史</h2>
            <p className="text-muted-foreground">
              查看和管理提示词的所有版本
            </p>
          </div>
        </div>
        
        {selectedVersions.length === 2 && (
          <Button asChild>
            <Link href={`/dashboard/prompts/${id}/versions/compare?v1=${selectedVersions[0]}&v2=${selectedVersions[1]}`}>
              <GitCompare className="mr-2 h-4 w-4" />
              对比版本
            </Link>
          </Button>
        )}
      </div>

      {/* Version selection hint */}
      {versions.length > 0 && selectedVersions.length < 2 && (
        <p className="text-sm text-muted-foreground">
          选择两个版本进行对比 ({selectedVersions.length}/2)
        </p>
      )}

      {/* Empty State */}
      {versions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="mt-4 text-lg font-semibold">暂无版本历史</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            发布提示词后会创建版本记录
          </p>
        </div>
      )}

      {/* Version List */}
      <div className="space-y-4">
        {versions.map((version, index) => (
          <Card 
            key={version.id}
            className={`cursor-pointer transition-colors ${
              selectedVersions.includes(version.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => toggleVersion(version.id)}
          >
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    V{version.versionNumber}
                  </Badge>
                  <CardTitle className="text-base font-medium">
                    {version.description || '无描述'}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(version.publishedAt)}
                  </span>
                  {index !== 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(version);
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      恢复
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
