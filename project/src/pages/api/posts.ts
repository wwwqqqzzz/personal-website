import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { verifyToken } from '../../utils/auth';

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
    console.error('获取文章列表错误:', error);
    return new Response(JSON.stringify({ error: '获取文章列表失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // 验证认证令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '未授权访问' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (!user) {
      return new Response(JSON.stringify({ error: '无效的认证令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取文章数据
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
      published: data.published || false,
      author_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 保存文章
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
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API 错误:', error);
    return new Response(
      JSON.stringify({ error: '服务器错误' }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: '缺少文章ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(null, { 
      status: 204 
    });
  } catch (error) {
    console.error('删除文章错误:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : '删除文章失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 