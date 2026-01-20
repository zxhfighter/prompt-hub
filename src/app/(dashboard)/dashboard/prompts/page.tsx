'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptCard } from '@/components/prompts/prompt-card';
import { PromptTable } from '@/components/prompts/prompt-table';
import { TagFilter } from '@/components/prompts/tag-filter';
import { SearchInput } from '@/components/search/search-input';
import { useFilterStore } from '@/stores/filter-store';
import { toast } from 'sonner';
import type { PromptStatus } from '@/types';

interface PromptItem {
  id: string;
  title: string;
  status: string;
  tags: { id: string; name: string; color: string }[];
  currentVersion: { versionNumber: number; publishedAt: string } | null;
  draftContent: string | null;
  versionContent: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PromptsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { search, status, tagIds, setFilters } = useFilterStore();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize store from URL on mount
  useEffect(() => {
    const searchParam = searchParams.get('search') || '';
    const statusParam = (searchParams.get('status') as PromptStatus | 'all') || 'all';
    const tagsParam = searchParams.get('tags');
    const tagIdsParam = tagsParam ? tagsParam.split(',') : [];

    setFilters({
      search: searchParam,
      status: statusParam,
      tagIds: tagIdsParam,
    });
    setIsInitialized(true);
  }, []); // Run once on mount

  // Sync store changes to URL
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (tagIds.length > 0) params.set('tags', tagIds.join(','));

    // Use router.replace to update URL without adding to history stack (optional)
    // or router.push to add history. user request implies "state... sync to url"
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [search, status, tagIds, pathname, router, isInitialized]);

  const fetchPrompts = useCallback(async () => {
    if (!isInitialized) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status !== 'all') params.set('status', status);
      if (tagIds.length > 0) params.set('tags', tagIds.join(','));
      
      const response = await fetch(`/api/prompts?${params}`);
      const result = await response.json();
      
      if (result.data) {
        setPrompts(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      toast.error('获取提示词列表失败');
    } finally {
      setLoading(false);
    }
  }, [search, status, tagIds, isInitialized]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      
      if (response.ok) {
        toast.success('提示词已删除');
        fetchPrompts();
      } else {
        toast.error('删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  const handleCopy = async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      const content = prompt.draftContent || prompt.versionContent || '';
      if (!content) {
        toast.error('提示词内容为空');
        return;
      }
      
      try {
        await navigator.clipboard.writeText(content);
        toast.success('已复制到剪贴板');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast.error('复制失败');
      }
    }
  };

  const formattedPrompts = useMemo(() => {
    return prompts.map(p => ({
      ...p,
      status: p.status as PromptStatus,
      tags: p.tags.map(t => ({
        ...t,
        userId: '',
        createdAt: new Date(),
      })),
      currentVersion: p.currentVersion ? {
        ...p.currentVersion,
        publishedAt: new Date(p.currentVersion.publishedAt),
      } : null,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  }, [prompts]);

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
        <TagFilter />
        <Tabs 
          value={status} 
          onValueChange={(v) => setFilters({ status: v as PromptStatus | 'all' })} 
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="published">已发布</TabsTrigger>
            <TabsTrigger value="draft">草稿</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Prompt Grid */}
      {/* Prompt Grid/List */}
      {!loading && formattedPrompts.length > 0 && (
        <>
          {/* Mobile: Grid View */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:hidden">
            {formattedPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onDelete={handleDelete}
                onCopy={handleCopy}
              />
            ))}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden md:block">
            <PromptTable 
              prompts={formattedPrompts}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && formattedPrompts.length === 0 && (
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
