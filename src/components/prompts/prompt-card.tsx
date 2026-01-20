import Link from "next/link";
import { Edit, Eye, Trash2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { TagBadge } from "@/components/tags/tag-badge";
import type { PromptListItem } from "@/types";

interface PromptCardProps {
  prompt: PromptListItem;
  onDelete?: (id: string) => void;
  onCopy?: (id: string) => void;
}

export function PromptCard({ prompt, onDelete, onCopy }: PromptCardProps) {
  const formattedDate = new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(prompt.updatedAt));

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1 min-w-0 pr-2">
          <Link
            href={`/dashboard/prompts/${prompt.id}`}
            className="font-semibold hover:underline line-clamp-1"
          >
            {prompt.title}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={prompt.status} />
            {prompt.currentVersion && (
              <span className="text-xs text-muted-foreground">
                V{prompt.currentVersion.versionNumber}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - Always visible on mobile */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            asChild
            title="查看"
          >
            <Link href={`/dashboard/prompts/${prompt.id}`}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            asChild
            title="编辑"
          >
            <Link href={`/dashboard/prompts/${prompt.id}/edit`}>
              <Edit className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onCopy?.(prompt.id)}
            title="复制内容"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete?.(prompt.id)}
            title="删除"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{prompt.tags.length - 3}
              </span>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">更新于 {formattedDate}</p>
      </CardContent>
    </Card>
  );
}
