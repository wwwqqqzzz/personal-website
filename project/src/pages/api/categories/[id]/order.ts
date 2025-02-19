import type { APIRoute } from 'astro';
import { verifyJWT } from '@/lib/auth';
import { handleAuthError, handleDatabaseError, handleNotFoundError, handleServerError, handleValidationError } from '@/lib/error-handlers';
import { getCategoryById, updateCategoryOrder } from '@/lib/db';
import { invalidateCategoryCache } from '@/lib/cache';
import { z } from 'zod';

const OrderSchema = z.object({
  order: z.number().int().min(0)
});

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
    const { data: category, error: categoryError } = await getCategoryById(id);

    if (categoryError) {
      return handleDatabaseError(categoryError);
    }

    if (!category) {
      return handleNotFoundError('分类不存在');
    }

    const body = await request.json();
    const validatedData = OrderSchema.safeParse(body);

    if (!validatedData.success) {
      return handleValidationError(validatedData.error);
    }

    const { data: updatedCategory, error: updateError } = await updateCategoryOrder(
      id,
      validatedData.data.order
    );

    if (updateError) {
      return handleDatabaseError(updateError);
    }

    // Invalidate both the specific category cache and the categories list cache
    invalidateCategoryCache(id);

    return new Response(JSON.stringify(updatedCategory), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleServerError();
  }
}; 