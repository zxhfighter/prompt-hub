'use client';

import { useState, use } from 'react';
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
import { updatePromptSchema, type UpdatePromptInput } from '@/lib/validations/prompt';
import { toast } from 'sonner';

// Mock data
const mockPrompt = {
  id: '1',
  title: '文章写作助手 - 长文内容生成',
  content: `# 文章写作助手

你是一个专业的文章写作助手。请根据以下要求生成高质量的文章内容。`,
  status: 'published' as const,
};

export default function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  
  // TODO: Fetch prompt by id
  const prompt = mockPrompt;
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdatePromptInput>({
    resolver: zodResolver(updatePromptSchema),
    defaultValues: {
      title: prompt.title,
      content: prompt.content,
    },
  });

  const content = watch('content');

  const onSaveDraft = async (data: UpdatePromptInput) => {
    console.log('Save draft:', data);
    toast.success('草稿已保存');
  };

  const onPublish = async (data: UpdatePromptInput) => {
    console.log('Publish:', data);
    toast.success('新版本已发布');
    router.push(`/dashboard/prompts/${id}`);
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
            <h2 className="text-2xl font-bold tracking-tight">编辑提示词</h2>
            <p className="text-muted-foreground">
              {isDirty && <span className="text-orange-500">有未保存的更改</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSubmit(onSaveDraft)} 
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            保存草稿
          </Button>
          <Button onClick={handleSubmit(onPublish)} disabled={isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            发布更新
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
                    placeholder="使用 Markdown 编写你的提示词..."
                    className="min-h-[400px] font-mono"
                    {...register('content')}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="min-h-[400px] rounded-md border bg-muted/50 p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {content || '预览内容将在这里显示...'}
                    </pre>
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
              <h3 className="font-semibold mb-4">版本信息</h3>
              <p className="text-sm text-muted-foreground">
                当前版本：V3
                <br />
                发布更新将创建 V4
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">提示</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• 保存草稿不会创建新版本</li>
                <li>• 发布更新会创建新版本</li>
                <li>• 可以随时回滚到历史版本</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
