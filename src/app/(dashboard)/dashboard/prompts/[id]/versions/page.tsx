'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Version {
  id: string;
  versionNumber: number;
  description: string | null;
  publishedAt: Date;
}

// Mock versions
const mockVersions: Version[] = [
  { id: 'v3', versionNumber: 3, description: '优化了输出格式', publishedAt: new Date('2024-01-15') },
  { id: 'v2', versionNumber: 2, description: '添加了变量支持', publishedAt: new Date('2024-01-12') },
  { id: 'v1', versionNumber: 1, description: '初始版本', publishedAt: new Date('2024-01-10') },
];

export default function VersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  
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

  const handleRestore = async (versionId: string) => {
    // TODO: Call restore API
    toast.success(`已恢复到版本 V${mockVersions.find(v => v.id === versionId)?.versionNumber}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

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
      {selectedVersions.length < 2 && (
        <p className="text-sm text-muted-foreground">
          选择两个版本进行对比 ({selectedVersions.length}/2)
        </p>
      )}

      {/* Version List */}
      <div className="space-y-4">
        {mockVersions.map((version, index) => (
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
                        handleRestore(version.id);
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
