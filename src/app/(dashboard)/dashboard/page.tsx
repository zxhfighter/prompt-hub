import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Send, Plus } from "lucide-react";
import { getUser } from "@/lib/auth/actions";
import { getPrompts } from "@/lib/db/queries/prompts";
import { getTagsWithCounts } from "@/lib/db/queries/tags";
import { TagCloud } from "@/components/dashboard/tag-cloud";
import { RecentPromptItem } from "@/components/dashboard/recent-prompt-item";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Fetch stats
  const [allPrompts, publishedPrompts, draftPrompts, tags] = await Promise.all([
    getPrompts({ userId: user.id, limit: 100 }),
    getPrompts({ userId: user.id, status: "published", limit: 100 }),
    getPrompts({ userId: user.id, status: "draft", limit: 100 }),
    getTagsWithCounts(user.id),
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
        <Link
          href="/dashboard/prompts"
          className="block hover:opacity-90 transition-opacity"
        >
          <Card className="p-4 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                总提示词
              </p>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <FileText className="h-8 w-8 text-primary/20" />
          </Card>
        </Link>
        <Link
          href="/dashboard/prompts?status=published"
          className="block hover:opacity-90 transition-opacity"
        >
          <Card className="p-4 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                已发布
              </p>
              <div className="text-2xl font-bold text-green-600">
                {stats.published}
              </div>
            </div>
            <Send className="h-8 w-8 text-green-600/20" />
          </Card>
        </Link>
        <Link
          href="/dashboard/prompts?status=draft"
          className="block hover:opacity-90 transition-opacity"
        >
          <Card className="p-4 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">草稿</p>
              <div className="text-2xl font-bold text-muted-foreground">
                {stats.drafts}
              </div>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground/20" />
          </Card>
        </Link>
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
              <Link
                href="/dashboard/prompts/new"
                className="text-primary hover:underline"
              >
                创建第一个
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPrompts.map((prompt) => (
                <RecentPromptItem key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tag Cloud */}
      <TagCloud
        tags={tags.map((t) => ({
          ...t,
          color: t.color || "#6366f1",
        }))}
      />
    </div>
  );
}
