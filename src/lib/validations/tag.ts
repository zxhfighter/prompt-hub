import { z } from 'zod';

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createTagSchema = z.object({
  name: z.string().min(1, '标签名不能为空').max(50, '标签名最多 50 个字符'),
  color: z.string().regex(hexColorRegex, '请输入有效的颜色值 (如 #6366f1)').optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(hexColorRegex).optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
