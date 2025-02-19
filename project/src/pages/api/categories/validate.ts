import type { APIRoute } from 'astro';
import { verifyJWT } from '@/lib/auth';
import { handleAuthError, handleDatabaseError, handleServerError } from '@/lib/error-handlers';
import { getCachedCategories } from '@/lib/cache';
import { validateCategoryTree } from '@/lib/category-tree';

export const GET: APIRoute = async ({ request }) => {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return handleAuthError();
    }

    const user = await verifyJWT(token);
    if (!user) {
      return handleAuthError();
    }

    const { data: categories, error } = await getCachedCategories();

    if (error) {
      return handleDatabaseError(error);
    }

    const isValid = validateCategoryTree(categories || []);

    return new Response(JSON.stringify({ isValid }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleServerError();
  }
}; 