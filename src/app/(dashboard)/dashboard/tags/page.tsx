"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagBadge } from "@/components/tags/tag-badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Tag } from "@/types";

// 20 vibrant neon colors
const colorOptions = [
  "#ff0080", // 霓虹粉
  "#ff00ff", // 霓虹紫红
  "#bf00ff", // 霓虹紫
  "#8000ff", // 电光紫
  "#6366f1", // 靛蓝
  "#4f46e5", // 深靛蓝
  "#3b82f6", // 明蓝
  "#0ea5e9", // 天蓝
  "#06b6d4", // 青色
  "#00ffff", // 霓虹青
  "#00ff80", // 霓虹薄荷
  "#00ff00", // 霓虹绿
  "#10b981", // 翠绿
  "#84cc16", // 黄绿
  "#facc15", // 金黄
  "#f59e0b", // 琥珀
  "#ff8000", // 霓虹橙
  "#ef4444", // 红色
  "#ff0040", // 霓虹红
  "#ec4899", // 粉色
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(colorOptions[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setTags(
        (result.data || []).map((t: Tag) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        })),
      );
    } catch {
      toast.error("获取标签失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreate = async () => {
    if (!newTagName.trim()) {
      toast.error("请输入标签名");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      });

      if (!response.ok) throw new Error("Failed to create");

      setNewTagName("");
      toast.success("标签已创建");
      fetchTags();
    } catch {
      toast.error("创建失败");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setEditingColor(tag.color);
  };

  const handleUpdate = async () => {
    if (!editingName.trim()) {
      toast.error("请输入标签名");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/tags/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim(), color: editingColor }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setEditingId(null);
      toast.success("标签已更新");
      fetchTags();
    } catch {
      toast.error("更新失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("标签已删除");
      fetchTags();
    } catch {
      toast.error("删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create new tag */}
      <Card>
        <CardHeader>
          <CardTitle>新建标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              placeholder="标签名称"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex flex-wrap gap-1.5 max-w-xs">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    newTagColor === color
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
            <Button onClick={handleCreate} disabled={saving}>
              <Plus className="mr-2 h-4 w-4" />
              创建
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tag list */}
      <Card>
        <CardHeader>
          <CardTitle>所有标签 ({tags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                {editingId === tag.id ? (
                  <div className="flex flex-1 items-center gap-3">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="max-w-[200px]"
                    />
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          className={`h-5 w-5 rounded-full ${
                            editingColor === color
                              ? "ring-2 ring-offset-1 ring-primary"
                              : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditingColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <TagBadge tag={tag} />
                )}

                <div className="flex items-center gap-1">
                  {editingId === tag.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleUpdate}
                        disabled={saving}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(tag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(tag.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {tags.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                暂无标签，创建一个吧
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除标签？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除该标签，并将其从所有关联的提示词中移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
