import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const RegisterSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名不能超过50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少8个字符').max(100, '密码不能超过100个字符')
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, password } = RegisterSchema.parse(body);

    // 检查邮箱是否已被注册
    const { data: existingUser } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: '该邮箱已被注册' }), 
        { status: 400 }
      );
    }

    // 对密码进行加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建管理员账号
    const { data: admin, error } = await supabase
      .from('admins')
      .insert([
        {
          name,
          email,
          password: hashedPassword
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        message: '注册成功',
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      }),
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          message: '输入验证失败', 
          errors: error.errors 
        }), 
        { status: 400 }
      );
    }

    console.error('注册错误:', error);
    return new Response(
      JSON.stringify({ message: '注册失败，请稍后重试' }), 
      { status: 500 }
    );
  }
}; 