import type { APIRoute } from 'astro';
import { verifyJWT } from '@/lib/auth';
import { handleAuthError, handleDatabaseError, handleNotFoundError, handleServerError, handleValidationError } from '@/lib/error-handlers';
import { validateCategory } from '@/lib/validators';
import { updateCategory, deleteCategory } from '@/lib/db';
import { getCachedCategoryById, invalidateCategoryCache } from '@/lib/cache';
import { ZodError } from 'zod';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const { data: category, error } = await getCachedCategoryById(id);

    if (error) {
      return handleDatabaseError(error);
    }

    if (!category) {
      return handleNotFoundError('分类不存在');
    }

    return new Response(JSON.stringify(category), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleServerError();
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return handleAuthError();
    }

    const user = await verifyJWT(token);
    if (!user) {
      return handleAuthError();
    }

    const { id } = params;
    const body = await request.json();
    const { data: validatedData, error: validationError } = await validateCategory(body);

    if (validationError) {
      return handleValidationError(validationError);
    }

    const { data: category, error: dbError } = await updateCategory(id, validatedData);

    if (dbError) {
      return handleDatabaseError(dbError);
    }

    if (!category) {
      return handleNotFoundError('分类不存在');
    }

    // Invalidate both the specific category cache and the categories list cache
    invalidateCategoryCache(id);

    return new Response(JSON.stringify(category), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    
    return handleServerError();
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return handleAuthError();
    }

    const user = await verifyJWT(token);
    if (!user) {
      return handleAuthError();
    }

    const { id } = params;
    const { error } = await deleteCategory(id);

    if (error) {
      return handleDatabaseError(error);
    }

    // Invalidate both the specific category cache and the categories list cache
    invalidateCategoryCache(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleServerError();
  }
}; 