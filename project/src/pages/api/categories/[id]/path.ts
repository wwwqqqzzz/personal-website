import type { APIRoute } from 'astro';
import { handleDatabaseError, handleNotFoundError, handleServerError } from '@/lib/error-handlers';
import { getCachedCategories } from '@/lib/cache';
import { findCategoryPath } from '@/lib/category-tree';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const { data: categories, error } = await getCachedCategories();

    if (error) {
      return handleDatabaseError(error);
    }

    const path = findCategoryPath(categories || [], id);

    if (path.length === 0) {
      return handleNotFoundError('分类不存在');
    }

    return new Response(JSON.stringify(path), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleServerError();
  }
}; 