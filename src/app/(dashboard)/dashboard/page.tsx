import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Send, Plus } from 'lucide-react';
import { getUser } from '@/lib/auth/actions';
import { getPrompts } from '@/lib/db/queries/prompts';

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    return null;
  }

  // Fetch stats
  const [allPrompts, publishedPrompts, draftPrompts] = await Promise.all([
    getPrompts({ userId: user.id, limit: 100 }),
    getPrompts({ userId: user.id, status: 'published', limit: 100 }),
    getPrompts({ userId: user.id, status: 'draft', limit: 100 }),
  ]);

  const stats = {
    total: allPrompts.pagination.total,
    published: publishedPrompts.pagination.total,
    drafts: draftPrompts.pagination.total,
  };

  // Get recent prompts
  const recentPrompts = allPrompts.data.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">仪表盘</h2>
          <p className="text-muted-foreground">
            管理你的 AI 提示词
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/prompts/new">
            <Plus className="mr-2 h-4 w-4" />
            新建提示词
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总提示词</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已发布</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">草稿</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.drafts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>最近编辑</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPrompts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无提示词，
              <Link href="/dashboard/prompts/new" className="text-primary hover:underline">
                创建第一个
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Link
                        href={`/dashboard/prompts/${prompt.id}`}
                        className="font-medium hover:underline"
                      >
                        {prompt.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {prompt.updatedAt
                          ? new Intl.DateTimeFormat('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(prompt.updatedAt))
                          : ''}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/prompts/${prompt.id}/edit`}>
                      编辑
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
