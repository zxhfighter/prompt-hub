'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptCard } from '@/components/prompts/prompt-card';
import type { PromptListItem, Tag } from '@/types';

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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索提示词..."
            className="pl-9"
          />
        </div>
        <Tabs defaultValue="all" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="published">已发布</TabsTrigger>
            <TabsTrigger value="draft">草稿</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Prompt Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onDelete={(id) => console.log('Delete:', id)}
            onCopy={(id) => console.log('Copy:', id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {mockPrompts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="mt-4 text-lg font-semibold">暂无提示词</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            开始创建你的第一个提示词吧
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/prompts/new">
              <Plus className="mr-2 h-4 w-4" />
              新建提示词
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
