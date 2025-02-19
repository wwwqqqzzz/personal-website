import { PostgrestError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

export function handleDatabaseError(error: PostgrestError) {
  if (error.code === '23505') {
    return new Response(JSON.stringify({ message: '该记录已存在' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (error.code === '23503') {
    return new Response(JSON.stringify({ message: '关联的记录不存在' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ message: '数据库操作失败' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function handleValidationError(error: ZodError) {
  return new Response(JSON.stringify({ 
    message: '验证失败', 
    errors: error.errors 
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function handleAuthError(message = '未授权') {
  return new Response(JSON.stringify({ message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function handleNotFoundError(message = '记录不存在') {
  return new Response(JSON.stringify({ message }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function handleServerError(message = '服务器内部错误') {
  return new Response(JSON.stringify({ message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
} 