'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptCard } from '@/components/prompts/prompt-card';
import { SearchInput } from '@/components/search/search-input';
import { useFilterStore } from '@/stores/filter-store';
import type { PromptListItem, Tag, PromptStatus } from '@/types';

// Mock data - will be replaced with real data fetching
const mockPrompts: PromptListItem[] = [
  {
    id: '1',
    title: '文章写作助手 - 长文内容生成',
    status: 'published',
    tags: [
      { id: 't1', userId: 'u1', name: '写作', color: '#6366f1', createdAt: new Date() },
      { id: 't2', userId: 'u1', name: 'GPT-4', color: '#10b981', createdAt: new Date() },
    ] as Tag[],
    currentVersion: { versionNumber: 3, publishedAt: new Date() },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: '代码审查专家',
    status: 'published_with_updates',
    tags: [
      { id: 't3', userId: 'u1', name: '开发', color: '#f59e0b', createdAt: new Date() },
    ] as Tag[],
    currentVersion: { versionNumber: 2, publishedAt: new Date() },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    title: '产品需求分析模板',
    status: 'draft',
    tags: [] as Tag[],
    currentVersion: null,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
];

export default function PromptsPage() {
  const { search, status, setStatus } = useFilterStore();

  const filteredPrompts = useMemo(() => {
    let result = [...mockPrompts];
    
    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(lowerSearch) ||
        p.tags.some(t => t.name.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Filter by status
    if (status !== 'all') {
      result = result.filter(p => p.status === status);
    }
    
    return result;
  }, [search, status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">提示词列表</h2>
          <p className="text-muted-foreground">
            管理你的所有 AI 提示词
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/prompts/new">
            <Plus className="mr-2 h-4 w-4" />
            新建提示词
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput />
        <Tabs 
          value={status} 
          onValueChange={(v) => setStatus(v as PromptStatus | 'all')} 
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="published">已发布</TabsTrigger>
            <TabsTrigger value="draft">草稿</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Prompt Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onDelete={(id) => console.log('Delete:', id)}
            onCopy={(id) => console.log('Copy:', id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredPrompts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="mt-4 text-lg font-semibold">
            {search ? '未找到匹配的提示词' : '暂无提示词'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? '尝试其他关键词' : '开始创建你的第一个提示词吧'}
          </p>
          {!search && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/prompts/new">
                <Plus className="mr-2 h-4 w-4" />
                新建提示词
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
