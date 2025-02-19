import type { APIRoute } from 'astro';
import { verifyJWT } from '@/lib/auth';
import { handleAuthError, handleDatabaseError, handleServerError, handleValidationError } from '@/lib/error-handlers';
import { validateCategory } from '@/lib/validators';
import { createCategory, deleteCategory, updateCategory } from '@/lib/db';
import { invalidateCategoryCache } from '@/lib/cache';
import { z } from 'zod';

const BatchOperationSchema = z.object({
  operations: z.array(z.object({
    type: z.enum(['create', 'update', 'delete']),
    id: z.string().optional(),
    data: z.record(z.any()).optional()
  }))
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return handleAuthError();
    }

    const user = await verifyJWT(token);
    if (!user) {
      return handleAuthError();
    }

    const body = await request.json();
    const validatedData = BatchOperationSchema.safeParse(body);

    if (!validatedData.success) {
      return handleValidationError(validatedData.error);
    }

    const results = [];
    const errors = [];

    for (const operation of validatedData.data.operations) {
      try {
        switch (operation.type) {
          case 'create': {
            if (!operation.data) {
              errors.push({ type: 'create', error: '缺少数据' });
              continue;
            }

            const { data: validatedCategory, error: validationError } = await validateCategory(operation.data);
            if (validationError) {
              errors.push({ type: 'create', error: validationError });
              continue;
            }

            const { data, error } = await createCategory(validatedCategory);
            if (error) {
              errors.push({ type: 'create', error });
            } else {
              results.push({ type: 'create', data });
            }
            break;
          }

          case 'update': {
            if (!operation.id || !operation.data) {
              errors.push({ type: 'update', error: '缺少ID或数据' });
              continue;
            }

            const { data: validatedCategory, error: validationError } = await validateCategory(operation.data);
            if (validationError) {
              errors.push({ type: 'update', error: validationError });
              continue;
            }

            const { data, error } = await updateCategory(operation.id, validatedCategory);
            if (error) {
              errors.push({ type: 'update', error });
            } else {
              results.push({ type: 'update', data });
            }
            break;
          }

          case 'delete': {
            if (!operation.id) {
              errors.push({ type: 'delete', error: '缺少ID' });
              continue;
            }

            const { error } = await deleteCategory(operation.id);
            if (error) {
              errors.push({ type: 'delete', error });
            } else {
              results.push({ type: 'delete', id: operation.id });
            }
            break;
          }
        }
      } catch (error) {
        errors.push({ type: operation.type, error: '操作失败' });
      }
    }

    // Invalidate all category caches since multiple categories might have been affected
    invalidateCategoryCache();

    return new Response(JSON.stringify({ results, errors }), {
      status: errors.length > 0 ? 207 : 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleServerError();
  }
}; 