import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 验证请求格式
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: '无效的请求格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: '请选择文件' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证文件类型
    const fileType = file.type.toLowerCase();
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(fileType)) {
      return new Response(JSON.stringify({ error: '只支持 JPG、PNG、GIF、WEBP 格式的图片' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证文件大小 (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: '文件大小不能超过2MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 生成文件名
    const ext = fileType.split('/')[1];
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // 转换文件为 buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 上传到 Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('covers')
      .upload(fileName, buffer, {
        contentType: fileType,
        upsert: false
      });

    if (uploadError) {
      console.error('上传错误:', uploadError);
      
      // 如果是bucket不存在的错误，尝试创建bucket
      if (uploadError.message === 'Bucket not found') {
        const { error: createBucketError } = await supabase.storage.createBucket('covers', {
          public: true
        });

        if (createBucketError) {
          throw createBucketError;
        }

        // 重试上传
        const { data: retryData, error: retryError } = await supabase.storage
          .from('covers')
          .upload(fileName, buffer, {
            contentType: fileType,
            upsert: false
          });

        if (retryError) {
          throw retryError;
        }
      } else {
        throw uploadError;
      }
    }

    // 获取公开访问URL
    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName);

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : '文件上传失败，请重试'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 