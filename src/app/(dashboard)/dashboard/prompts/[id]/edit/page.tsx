"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownPreview } from "@/components/markdown/markdown-preview";
import {
  updatePromptSchema,
  type UpdatePromptInput,
} from "@/lib/validations/prompt";
import { toast } from "sonner";
import { PublishDialog } from "@/components/prompts/publish-dialog";
import { DiagnoseDialog } from "@/components/ai/diagnose-dialog";

interface PromptData {
  id: string;
  title: string;
  status: string;
  draftContent: string | null;
  currentVersion: {
    versionNumber: number;
    content: string;
  } | null;
}

export default function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState<PromptData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdatePromptInput>({
    resolver: zodResolver(updatePromptSchema),
  });

  useEffect(() => {
    async function fetchPrompt() {
      try {
        const response = await fetch(`/api/prompts/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch prompt");
        }
        const result = await response.json();
        const data = result.data as PromptData;
        setPrompt(data);

        // Set form default values
        const content = data.draftContent || data.currentVersion?.content || "";
        reset({
          title: data.title,
          content: content,
        });
      } catch (error) {
        console.error("Failed to fetch prompt:", error);
        toast.error("加载失败");
      } finally {
        setLoading(false);
      }
    }

    fetchPrompt();
  }, [id, reset]);

  useEffect(() => {
    console.log("EditPage mounted, setValue available:", !!setValue);
  }, [setValue]);

  const content = watch("content");

  const onSaveDraft = async (data: UpdatePromptInput) => {
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || "保存失败");
      }

      // Reset form state to mark as saved
      reset(data, { keepValues: true });
      toast.success("草稿已保存");
    } catch (error) {
      console.error("Save draft error:", error);
      toast.error(error instanceof Error ? error.message : "保存失败");
    }
  };

  const onPublish = async (description: string) => {
    const data = watch(); // Get current form data

    try {
      // First save the draft
      const saveResponse = await fetch(`/api/prompts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!saveResponse.ok) {
        const result = await saveResponse.json();
        throw new Error(result.error?.message || "保存失败");
      }

      // Then publish a new version
      const response = await fetch(`/api/prompts/${id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || "发布失败");
      }

      toast.success("新版本已发布");
      router.push(`/dashboard/prompts/${id}`);
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(error instanceof Error ? error.message : "发布失败");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">提示词不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-muted-foreground h-8 flex items-center">
              {isDirty && (
                <span className="text-orange-500">有未保存的更改</span>
              )}
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
          <DiagnoseDialog
            content={content || ""}
            promptId={id}
            onUpdateContent={(newContent) =>
              setValue("content", newContent, { shouldDirty: true })
            }
          />
          <PublishDialog
            onConfirm={onPublish}
            isSubmitting={isSubmitting}
            title="发布更新"
            description="请输入版本更新说明。"
            currentContent={content || ""}
            previousContent={prompt.currentVersion?.content || null}
            previousVersionNumber={prompt.currentVersion?.versionNumber || 0}
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
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">内容</Label>
              <Tabs
                value={previewMode}
                onValueChange={(v) => setPreviewMode(v as "edit" | "preview")}
              >
                <TabsList className="mb-2">
                  <TabsTrigger value="edit">编辑</TabsTrigger>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-0">
                  <Textarea
                    id="content"
                    placeholder="使用 Markdown 编写你的提示词..."
                    className="min-h-[400px] font-mono"
                    {...register("content")}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="min-h-[400px] rounded-md border bg-background p-4 overflow-auto">
                    <MarkdownPreview content={content || ""} />
                  </div>
                </TabsContent>
              </Tabs>
              {errors.content && (
                <p className="text-sm text-destructive">
                  {errors.content.message}
                </p>
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
                当前版本：V{prompt.currentVersion?.versionNumber || 0}
                <br />
                发布更新将创建 V
                {(prompt.currentVersion?.versionNumber || 0) + 1}
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
