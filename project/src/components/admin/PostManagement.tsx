import React, { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  createdAt: string;
  status: 'draft' | 'published';
}

const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/posts/${id}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === id ? { ...post, status: 'published' } : post
        ));
      }
    } catch (error) {
      console.error('Error publishing post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          暂无文章，开始写作吧！
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">标题</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">创建时间</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">状态</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 text-sm text-gray-300">{post.title}</td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.status === 'published' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {post.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <a
                    href={`/admin/edit-post/${post.id}`}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    编辑
                  </a>
                  {post.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      className="text-green-400 hover:text-green-300"
                    >
                      发布
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PostManagement; 