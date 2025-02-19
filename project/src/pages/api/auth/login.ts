import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    // 验证必填字段
    if (!email || !password) {
      return new Response(JSON.stringify({ error: '请填写邮箱和密码' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 查询用户
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email,
        name: admin.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('登录错误:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : '登录失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 