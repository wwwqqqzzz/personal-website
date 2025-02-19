import { verifyToken } from './utils/auth';
import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, cookies } = context;
  
  // 获取请求路径
  const url = new URL(request.url);
  const path = url.pathname;

  // 公开路由列表
  const publicRoutes = [
    '/',
    '/posts',
    '/api/posts',
    '/rss.xml',
    '/sitemap.xml',
    '/sign-in',
    '/sign-up',
    '/api/auth/login',
    '/api/auth/register',
    '/assets',
    '/_astro',
    '/favicon.ico',
    '/tech'
  ];

  // 检查是否是公开路由
  if (publicRoutes.some(route => path.startsWith(route))) {
    return await next();
  }

  // 获取认证令牌
  const token = cookies.get('token')?.value;
  if (!token) {
    return redirect('/admin/login');
  }

  try {
    // 验证令牌
    const user = await verifyToken(token);
    if (!user) {
      cookies.delete('token');
      return redirect('/admin/login');
    }

    // 继续处理请求
    return await next();
  } catch (error) {
    console.error('认证错误:', error);
    cookies.delete('token');
    return redirect('/admin/login');
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}; 