import React, { useEffect, useState } from 'react';
import type { FC } from 'react';

interface Post {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  cover?: string;
}

interface ArchiveGroup {
  year: number;
  months: {
    month: number;
    posts: Post[];
  }[];
}

const ArchiveManagement: FC = () => {
  const [archives, setArchives] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/posts');
        const posts: Post[] = await response.json();
        
        // 按年月分组文章
        const groupedPosts = posts.reduce((groups: { [key: string]: { [key: string]: Post[] } }, post) => {
          const date = new Date(post.createdAt);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          
          if (!groups[year]) {
            groups[year] = {};
          }
          if (!groups[year][month]) {
            groups[year][month] = [];
          }
          
          groups[year][month].push(post);
          return groups;
        }, {});

        // 转换为组件所需的数据结构
        const archiveGroups: ArchiveGroup[] = Object.entries(groupedPosts)
          .map(([year, months]) => ({
            year: parseInt(year),
            months: Object.entries(months).map(([month, posts]) => ({
              month: parseInt(month),
              posts: posts.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
            })).sort((a, b) => b.month - a.month)
          }))
          .sort((a, b) => b.year - a.year);

        setArchives(archiveGroups);
      } catch (error) {
        console.error('Failed to fetch archives:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {archives.map(({ year, months }) => (
        <div key={year} className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-300 mb-4">{year}年</h2>
          <div className="space-y-6">
            {months.map(({ month, posts }) => (
              <div key={`${year}-${month}`} className="pl-4 border-l-2 border-purple-500">
                <h3 className="text-lg font-semibold text-gray-400 mb-3">{month}月</h3>
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div 
                      key={post.id}
                      className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {post.cover && (
                        <img 
                          src={post.cover} 
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-gray-200 font-medium">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm px-2 py-0.5 bg-purple-600 text-white rounded">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {archives.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">暂无文章</p>
        </div>
      )}
    </div>
  );
};

export default ArchiveManagement; 