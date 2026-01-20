'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownPreview } from '@/components/markdown/markdown-preview';
import { createPromptSchema, type CreatePromptInput } from '@/lib/validations/prompt';
import { toast } from 'sonner';
import { PublishDialog } from '@/components/prompts/publish-dialog';
import type { Tag } from '@/types';

export default function NewPromptPage() {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePromptInput>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: '',
      content: '',
      publish: false,
    },
  });

  const content = watch('content');

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const result = await response.json();
        setTags((result.data || []).map((t: Tag) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        })));
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingTags(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const onSubmit = async (data: CreatePromptInput) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tagIds: selectedTagIds,
        }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || '保存失败');
      }
      
      toast.success(data.publish ? '提示词已发布' : '草稿已保存');
      router.push('/dashboard/prompts');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败');
    }
  };

  const handleSaveDraft = handleSubmit((data) => onSubmit({ ...data, publish: false }));
  
  const handlePublish = async (description: string) => {
    await handleSubmit((data) => onSubmit({ 
      ...data, 
      publish: true,
      description 
    }))();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/prompts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">新建提示词</h2>
            <p className="text-muted-foreground">创建一个新的 AI 提示词</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            保存草稿
          </Button>
          <PublishDialog 
            onConfirm={handlePublish}
            isSubmitting={isSubmitting}
            title="发布提示词"
            description="请输入发布说明，这将作为 V1 版本的描述。"
            currentContent={content || ''}
            previousContent={null}
            previousVersionNumber={0}
          />
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                placeholder="输入提示词标题"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">内容</Label>
              <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'edit' | 'preview')}>
                <TabsList className="mb-2">
                  <TabsTrigger value="edit">编辑</TabsTrigger>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-0">
                  <Textarea
                    id="content"
                    placeholder="使用 Markdown 编写你的提示词...&#10;&#10;支持 {{variable}} 变量语法"
                    className="min-h-[400px] font-mono"
                    {...register('content')}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="min-h-[400px] rounded-md border bg-background p-4 overflow-auto">
                    <MarkdownPreview content={content || ''} />
                  </div>
                </TabsContent>
              </Tabs>
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">标签</h3>
              {loadingTags ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  暂无标签，
                  <Link href="/dashboard/tags" className="text-primary hover:underline">
                    去创建
                  </Link>
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${
                          isSelected 
                            ? 'scale-105 shadow-md' 
                            : 'opacity-50 hover:opacity-80 hover:scale-102'
                        }`}
                        style={{ 
                          backgroundColor: isSelected ? tag.color : `${tag.color}40`,
                          color: isSelected ? '#fff' : tag.color,
                          border: `2px solid ${tag.color}`,
                        }}
                      >
                        {tag.name}
                        {isSelected && (
                          <span className="ml-1.5 text-xs">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">提示</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• 使用 Markdown 语法格式化内容</li>
                <li>• 支持 {'{{variable}}'} 变量语法</li>
                <li>• 保存草稿不会创建版本</li>
                <li>• 发布后会创建新版本 V1</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
