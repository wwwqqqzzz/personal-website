import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { buildCategoryTree } from '@/lib/category-tree';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('获取分类列表失败:', error);
      return new Response(JSON.stringify({ error: '获取分类列表失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tree = buildCategoryTree(categories || []);

    return new Response(JSON.stringify(tree), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('构建分类树失败:', error);
    return new Response(JSON.stringify({ error: '构建分类树失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 