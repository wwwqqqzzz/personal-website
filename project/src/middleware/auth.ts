import type { MiddlewareResponseHandler } from 'astro';
import { supabase } from '../lib/supabase';

export const authMiddleware: MiddlewareResponseHandler = async ({ request, redirect, cookies }) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // 公开路由列表
  const publicRoutes = [
    '/',
    '/posts',
    '/sign-in',
    '/sign-up',
    '/api/auth/login',
    '/api/auth/register',
    '/assets',
    '/_astro'
  ];

  // 检查是否是公开路由
  if (publicRoutes.some(route => path.startsWith(route))) {
    return;
  }

  // 获取认证令牌
  const token = cookies.get('token')?.value;
  if (!token) {
    return redirect('/sign-in');
  }

  try {
    // 验证会话
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      cookies.delete('token');
      return redirect('/sign-in');
    }

    // 检查是否是管理员
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!admin) {
      cookies.delete('token');
      return redirect('/sign-in');
    }

    return;

  } catch (error) {
    console.error('认证错误:', error);
    cookies.delete('token');
    return redirect('/sign-in');
  }
}; 