import { clerkClient } from '@clerk/clerk-sdk-node';

export default async function middleware(request: Request) {
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
    '/api/webhook',
    '/assets',
    '/_astro',
    '/favicon.ico'
  ];

  // 检查是否是公开路由
  if (publicRoutes.some(route => path.startsWith(route))) {
    return;
  }

  // 获取认证会话
  const sessionId = request.headers.get('Authorization')?.split(' ')[1];
  if (!sessionId) {
    return Response.redirect(new URL('/sign-in', request.url));
  }

  try {
    // 获取会话信息
    const session = await clerkClient.sessions.getSession(sessionId);
    if (!session?.userId) {
      throw new Error('Invalid session');
    }

    // 获取用户信息
    const user = await clerkClient.users.getUser(session.userId);
    const isAdmin = user.publicMetadata.role === 'admin';

    // 如果访问管理员路由但不是管理员，重定向到首页
    if (path.startsWith('/admin') && !isAdmin) {
      return Response.redirect(new URL('/', request.url));
    }
  } catch (error) {
    return Response.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}; 