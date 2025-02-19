import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { verifyToken } from '../../../utils/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 验证必填字段
    if (!data.title || !data.content || !data.category || !data.summary) {
      return new Response(
        JSON.stringify({ error: '请填写所有必填字段' }),
        { status: 400 }
      );
    }

    const postData = {
      title: data.title,
      content: data.content,
      summary: data.summary,
      category: data.category,
      tags: data.tags || [],
      cover_image: data.cover_image || null,
      layout: data.layout || 'single',
      type: data.type || 'article',
      published: data.published || false
    };

    const { data: post, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('数据库错误:', error);
      return new Response(
        JSON.stringify({ error: '保存文章失败' }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(post), {
      status: 201
    });
  } catch (error) {
    console.error('API 错误:', error);
    return new Response(
      JSON.stringify({ error: '服务器错误' }),
      { status: 500 }
    );
  }
} 