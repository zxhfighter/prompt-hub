'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPromptSchema, type CreatePromptInput } from '@/lib/validations/prompt';
import { toast } from 'sonner';

export default function NewPromptPage() {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  
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

  const onSubmit = async (data: CreatePromptInput) => {
    // TODO: Implement create prompt API call
    console.log('Create prompt:', data);
    toast.success(data.publish ? '提示词已发布' : '草稿已保存');
    router.push('/dashboard/prompts');
  };

  const handleSaveDraft = handleSubmit((data) => onSubmit({ ...data, publish: false }));
  const handlePublish = handleSubmit((data) => onSubmit({ ...data, publish: true }));

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
          <Button onClick={handlePublish} disabled={isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            发布
          </Button>
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
                    placeholder="使用 Markdown 编写你的提示词...

支持 {{variable}} 变量语法"
                    className="min-h-[400px] font-mono"
                    {...register('content')}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="min-h-[400px] rounded-md border bg-muted/50 p-4 prose prose-sm max-w-none">
                    {content || <span className="text-muted-foreground">预览内容将在这里显示...</span>}
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
              <p className="text-sm text-muted-foreground">
                标签功能即将上线...
              </p>
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
