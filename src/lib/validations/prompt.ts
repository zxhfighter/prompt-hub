import { z } from 'zod';

export const createPromptSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 个字符'),
  content: z.string().min(1, '内容不能为空'),
  tagIds: z.array(z.string().uuid()).optional(),
  publish: z.boolean().optional(),
  description: z.string().max(500, '描述最多 500 个字符').optional(),
});

export const updatePromptSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const publishVersionSchema = z.object({
  description: z.string().max(500).optional(),
});

export const deletePromptSchema = z.object({
  confirmation: z.literal('DELETE', { message: '请输入 DELETE 确认删除' }),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
export type PublishVersionInput = z.infer<typeof publishVersionSchema>;
export type DeletePromptInput = z.infer<typeof deletePromptSchema>;
