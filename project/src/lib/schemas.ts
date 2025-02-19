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

export const CategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称不能超过50个字符'),
  slug: z.string().min(1, '分类别名不能为空').max(50, '分类别名不能超过50个字符')
    .regex(/^[a-z0-9-]+$/, '分类别名只能包含小写字母、数字和连字符'),
  description: z.string().max(200, '描述不能超过200个字符').optional(),
  parent_id: z.string().optional(),
  order: z.number().int().min(0).default(0)
});

export type Post = z.infer<typeof PostSchema>;
export type Category = z.infer<typeof CategorySchema>; 