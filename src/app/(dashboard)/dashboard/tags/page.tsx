'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TagBadge } from '@/components/tags/tag-badge';
import { toast } from 'sonner';
import type { Tag } from '@/types';

// Mock tags
const initialTags: Tag[] = [
  { id: 't1', userId: 'u1', name: '写作', color: '#6366f1', createdAt: new Date() },
  { id: 't2', userId: 'u1', name: 'GPT-4', color: '#10b981', createdAt: new Date() },
  { id: 't3', userId: 'u1', name: '开发', color: '#f59e0b', createdAt: new Date() },
  { id: 't4', userId: 'u1', name: '产品', color: '#ec4899', createdAt: new Date() },
];

const colorOptions = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(colorOptions[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');

  const handleCreate = async () => {
    if (!newTagName.trim()) {
      toast.error('请输入标签名');
      return;
    }
    
    // TODO: Call API
    const newTag: Tag = {
      id: crypto.randomUUID(),
      userId: 'u1',
      name: newTagName.trim(),
      color: newTagColor,
      createdAt: new Date(),
    };
    
    setTags([...tags, newTag]);
    setNewTagName('');
    toast.success('标签已创建');
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setEditingColor(tag.color);
  };

  const handleUpdate = async () => {
    if (!editingName.trim()) {
      toast.error('请输入标签名');
      return;
    }
    
    // TODO: Call API
    setTags(tags.map(t => 
      t.id === editingId 
        ? { ...t, name: editingName.trim(), color: editingColor }
        : t
    ));
    setEditingId(null);
    toast.success('标签已更新');
  };

  const handleDelete = async (id: string) => {
    // TODO: Call API
    setTags(tags.filter(t => t.id !== id));
    toast.success('标签已删除');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">标签管理</h2>
        <p className="text-muted-foreground">
          创建和管理你的提示词标签
        </p>
      </div>

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
            <div className="flex gap-1">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    newTagColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
            <Button onClick={handleCreate}>
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
                    <div className="flex gap-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          className={`h-6 w-6 rounded-full ${
                            editingColor === color ? 'ring-2 ring-offset-1 ring-primary' : ''
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
                      <Button variant="ghost" size="icon" onClick={handleUpdate}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(tag)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tag.id)}
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
    </div>
  );
}
