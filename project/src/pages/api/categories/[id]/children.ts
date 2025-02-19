import type { APIRoute } from 'astro';
import { handleDatabaseError, handleNotFoundError, handleServerError } from '@/lib/error-handlers';
import { getCachedCategories } from '@/lib/cache';
import { buildCategoryTree, findCategoryNode } from '@/lib/category-tree';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const { data: categories, error } = await getCachedCategories();

    if (error) {
      return handleDatabaseError(error);
    }

    const tree = buildCategoryTree(categories || []);
    const node = findCategoryNode(tree, id);

    if (!node) {
      return handleNotFoundError('分类不存在');
    }

    return new Response(JSON.stringify(node.children), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleServerError();
  }
}; 