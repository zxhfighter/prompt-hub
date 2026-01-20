"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecentPromptItemProps {
  prompt: {
    id: string;
    title: string;
    updatedAt: Date | null;
    draftContent: string | null;
    versionContent: string | null;
  };
}

export function RecentPromptItem({ prompt }: RecentPromptItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Prefer published version content, fallback to draft
    const content = prompt.versionContent || prompt.draftContent || "";

    if (!content) {
      toast.error("该提示词暂无可复制的内容");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("复制失败");
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
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
              ? new Intl.DateTimeFormat("zh-CN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(prompt.updatedAt))
              : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCopy}
          title="复制内容"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/prompts/${prompt.id}/edit`}>编辑</Link>
        </Button>
      </div>
    </div>
  );
}
