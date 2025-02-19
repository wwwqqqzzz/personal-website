import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/utils/auth';
import { handleAuthError, handleDatabaseError, handleServerError, handleValidationError } from '@/lib/error-handlers';
import { validateCategory } from '@/lib/validators';
import { createCategory } from '@/lib/db';
import { getCachedCategories, invalidateCategoryCache } from '@/lib/cache';
import { ZodError } from 'zod';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return new Response(JSON.stringify({ error: '获取分类列表失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return handleAuthError('未提供认证令牌');
    }

    const user = await verifyToken(token);
    if (!user) {
      return handleAuthError('无效的认证令牌');
    }

    const data = await request.json();
    const { data: validatedData, error: validationError } = await validateCategory(data);
    
    if (validationError) {
      return handleValidationError(validationError);
    }

    const { data: category, error: dbError } = await supabase
      .from('categories')
      .insert([{
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      console.error('数据库错误:', dbError);
      return handleDatabaseError(dbError);
    }

    // 清除缓存
    invalidateCategoryCache();

    return new Response(JSON.stringify(category), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API 错误:', error);
    return handleServerError();
  }
}; 