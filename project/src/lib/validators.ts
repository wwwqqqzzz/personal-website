import { z } from 'zod';
import { CategorySchema } from './schemas';

export async function validateCategory(data: unknown) {
  try {
    const validatedData = await CategorySchema.parseAsync(data);
    return {
      data: validatedData,
      error: null
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      return {
        data: null,
        error: {
          message: '数据验证失败',
          errors
        }
      };
    }
    throw error;
  }
}

export function validateSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

export function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
} 