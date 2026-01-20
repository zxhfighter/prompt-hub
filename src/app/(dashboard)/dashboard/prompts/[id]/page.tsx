import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/prompts/status-badge";
import { TagBadge } from "@/components/tags/tag-badge";
import { PromptActions } from "@/components/prompts/prompt-actions";
import { MarkdownPreview } from "@/components/markdown/markdown-preview";
import { getPromptById } from "@/lib/db/queries/prompts";
import { getUser } from "@/lib/auth/actions";
import type { PromptStatus } from "@/types";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUser();
  if (!user) {
    notFound();
  }

  const prompt = await getPromptById(id, user.id);

  if (!prompt) {
    notFound();
  }

  const content = prompt.currentVersion?.content || prompt.draftContent || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {prompt.title}
            </h2>
            <StatusBadge status={prompt.status as PromptStatus} />
          </div>
          {prompt.tags?.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={{
                    ...tag,
                    color: tag.color || "#6366f1",
                    createdAt: tag.createdAt || new Date(),
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>

        <PromptActions promptId={id} content={content} />
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
                  <div className="min-h-[200px]">
                    <MarkdownPreview content={content || "暂无内容"} />
                  </div>
                </TabsContent>
                <TabsContent value="raw">
                  <pre className="rounded-lg bg-muted p-4 text-sm font-mono overflow-x-auto">
                    {content || "暂无内容"}
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
                  {prompt.createdAt
                    ? new Intl.DateTimeFormat("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(new Date(prompt.createdAt))
                    : "-"}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">最后更新</p>
                <p className="text-sm font-medium">
                  {prompt.updatedAt
                    ? new Intl.DateTimeFormat("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(new Date(prompt.updatedAt))
                    : "-"}
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
