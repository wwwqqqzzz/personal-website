import { z } from 'zod';

export const PostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  content: z.string().min(1, '内容不能为空'),
  cover_image: z.string().optional(),
  category: z.string().min(1, '分类不能为空'),
  tags: z.array(z.string()),
  summary: z.string().min(1, '摘要不能为空').max(200, '摘要不能超过200个字符'),
  layout: z.enum(['single', 'two-column']).default('single'),
  type: z.enum(['article', 'note', 'tutorial']).default('article'),
  published: z.boolean().default(false)
});

export type Post = z.infer<typeof PostSchema>; 