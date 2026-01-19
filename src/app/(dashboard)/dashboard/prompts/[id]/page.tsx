import Link from 'next/link';
import { ArrowLeft, Edit, Copy, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/prompts/status-badge';
import { TagBadge } from '@/components/tags/tag-badge';
import type { PromptWithTags, Tag, PromptVersion } from '@/types';

// Mock data
const mockPrompt: PromptWithTags = {
  id: '1',
  userId: 'u1',
  title: '文章写作助手 - 长文内容生成',
  currentVersionId: 'v3',
  draftContent: null,
  status: 'published',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-15'),
  tags: [
    { id: 't1', userId: 'u1', name: '写作', color: '#6366f1', createdAt: new Date() },
    { id: 't2', userId: 'u1', name: 'GPT-4', color: '#10b981', createdAt: new Date() },
  ] as Tag[],
  currentVersion: {
    id: 'v3',
    promptId: '1',
    versionNumber: 3,
    content: `# 文章写作助手

你是一个专业的文章写作助手。请根据以下要求生成高质量的文章内容：

## 任务
根据用户提供的主题和要求，生成一篇结构完整、逻辑清晰的文章。

## 输入
- 主题：{{topic}}
- 字数要求：{{word_count}}
- 风格：{{style}}

## 输出要求
1. 包含引人注目的标题
2. 清晰的段落结构
3. 适当的过渡语句
4. 总结性结尾

请开始创作：`,
    description: '优化了输出格式，增加了变量支持',
    changelog: null,
    isPublished: true,
    publishedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
  } as PromptVersion,
};

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // TODO: Fetch prompt by id
  const prompt = mockPrompt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/dashboard/prompts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{prompt.title}</h2>
              <StatusBadge status={prompt.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            复制
          </Button>
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            AI 诊断
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/prompts/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Link>
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>内容</CardTitle>
                {prompt.currentVersion && (
                  <span className="text-sm text-muted-foreground">
                    V{prompt.currentVersion.versionNumber}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview">
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">预览</TabsTrigger>
                  <TabsTrigger value="raw">原始文本</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {prompt.currentVersion?.content || prompt.draftContent || '暂无内容'}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="raw">
                  <pre className="rounded-lg bg-muted p-4 text-sm font-mono overflow-x-auto">
                    {prompt.currentVersion?.content || prompt.draftContent || '暂无内容'}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">创建时间</p>
                <p className="text-sm font-medium">
                  {new Intl.DateTimeFormat('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).format(new Date(prompt.createdAt))}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">最后更新</p>
                <p className="text-sm font-medium">
                  {new Intl.DateTimeFormat('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).format(new Date(prompt.updatedAt))}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">当前版本</p>
                <p className="text-sm font-medium">
                  V{prompt.currentVersion?.versionNumber || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>版本历史</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/prompts/${id}/versions`}>
                  查看所有版本
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
