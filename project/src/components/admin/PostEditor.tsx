import React, { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';

interface PostEditorProps {
  initialContent?: string;
  initialTitle?: string;
  initialCover?: string;
  initialCategory?: string;
  initialTags?: string[];
  initialSummary?: string;
  initialLayout?: 'single' | 'two-column';
  initialType?: 'article' | 'note' | 'tutorial';
  initialStatus?: 'draft' | 'published';
  onSave: (data: {
    title: string;
    content: string;
    cover: string;
    category: string;
    tags: string[];
    summary: string;
    layout: 'single' | 'two-column';
    type: 'article' | 'note' | 'tutorial';
    status: 'draft' | 'published';
  }) => void;
}

const PostEditor: FC<PostEditorProps> = ({
  initialContent = '',
  initialTitle = '',
  initialCover = '',
  initialCategory = '',
  initialTags = [],
  initialSummary = '',
  initialLayout = 'single',
  initialType = 'article',
  initialStatus = 'draft',
  onSave
}) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const vditorRef = useRef<Vditor | null>(null);
  const [cover, setCover] = useState(initialCover);
  const [previewUrl, setPreviewUrl] = useState(initialCover);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [layout, setLayout] = useState<'single' | 'two-column'>(initialLayout);
  const [type, setType] = useState<'article' | 'note' | 'tutorial'>(initialType);
  const [status, setStatus] = useState<'draft' | 'published'>(initialStatus);

  useEffect(() => {
    const initVditor = async () => {
      if (editorRef.current && !vditorRef.current) {
        vditorRef.current = new Vditor(editorRef.current, {
          height: 'calc(100vh - 200px)',
          mode: 'ir',
          theme: 'dark',
          cache: {
            enable: false
          },
          preview: {
            theme: {
              current: 'dark'
            }
          },
          counter: {
            enable: true
          },
          typewriterMode: true,
          toolbarConfig: {
            pin: true
          },
          outline: {
            enable: true,
            position: 'right'
          },
          upload: {
            accept: 'image/*',
            url: '/api/upload'
          },
          toolbar: [
            'emoji',
            'headings',
            'bold',
            'italic',
            'strike',
            'link',
            '|',
            'list',
            'ordered-list',
            'check',
            'outdent',
            'indent',
            '|',
            'quote',
            'line',
            'code',
            'inline-code',
            'insert-before',
            'insert-after',
            '|',
            'upload',
            'table',
            '|',
            'undo',
            'redo',
            '|',
            'fullscreen',
            'edit-mode',
            {
              name: 'more',
              toolbar: [
                'both',
                'code-theme',
                'content-theme',
                'export',
                'outline',
                'preview',
                'devtools',
                'info',
                'help',
              ],
            },
          ],
          after: () => {
            if (vditorRef.current && initialContent) {
              vditorRef.current.setValue(initialContent);
            }
            // 设置编辑器样式
            const style = document.createElement('style');
            style.textContent = `
              .vditor-ir {
                background-color: #1a1a1a !important;
              }
              .vditor-ir pre.vditor-reset {
                background-color: #1a1a1a !important;
                color: #e4e4e4 !important;
              }
              .vditor-toolbar {
                background-color: #2d2d2d !important;
                border-bottom: 1px solid #3d3d3d !important;
              }
              .vditor-toolbar__item {
                color: #e4e4e4 !important;
              }
              .vditor-toolbar__item:hover {
                background-color: #3d3d3d !important;
              }
            `;
            document.head.appendChild(style);
          }
        });
      }
    };

    initVditor();

    return () => {
      if (vditorRef.current) {
        vditorRef.current.destroy();
      }
    };
  }, []);

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCover(base64String);
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSave = async (shouldPublish = false) => {
    const title = titleRef.current?.value;
    const category = categoryRef.current?.value;
    const summary = summaryRef.current?.value;

    if (!title?.trim()) {
      alert('请输入文章标题');
      return;
    }
    if (!category?.trim()) {
      alert('请输入文章分类');
      return;
    }
    if (!summary?.trim()) {
      alert('请输入文章摘要');
      return;
    }

    if (vditorRef.current) {
      const content = vditorRef.current.getValue();
      const newStatus = shouldPublish ? 'published' : 'draft';
      setStatus(newStatus);
      
      // 备份到 GitHub
      try {
        await fetch('http://localhost:8080/api/posts/backup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            title,
            content,
            cover,
            category,
            tags,
            summary,
            layout,
            type,
            status: newStatus
          })
        });
      } catch (error) {
        console.error('Failed to backup to GitHub:', error);
      }

      onSave({
        title,
        content,
        cover,
        category,
        tags,
        summary,
        layout,
        type,
        status: newStatus
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* 顶部工具栏 */}
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg 
                         hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                返回
              </button>
              <span className="text-gray-400">
                {status === 'published' ? '已发布' : '草稿'}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleSave(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg 
                         hover:bg-gray-700 transition-colors"
              >
                保存草稿
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg 
                         hover:bg-purple-700 transition-colors"
              >
                发布文章
              </button>
            </div>
          </div>
        </div>

        {/* 主要内容区 */}
        <div className="grid grid-cols-3 gap-6">
          {/* 左侧：标题、分类、摘要 */}
          <div className="col-span-2 space-y-4">
            <input
              ref={titleRef}
              type="text"
              defaultValue={initialTitle}
              placeholder="请输入文章标题..."
              className="w-full px-4 py-2 text-xl font-bold bg-gray-800 border border-gray-700 
                       text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 
                       focus:border-transparent outline-none transition-colors"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                ref={categoryRef}
                type="text"
                defaultValue={initialCategory}
                placeholder="请输入文章分类..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 
                         text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 
                         focus:border-transparent outline-none transition-colors"
              />
              <select
                value={type}
                onChange={e => setType(e.target.value as 'article' | 'note' | 'tutorial')}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 
                         text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 
                         focus:border-transparent outline-none transition-colors"
              >
                <option value="article">文章</option>
                <option value="note">笔记</option>
                <option value="tutorial">教程</option>
              </select>
            </div>
            <textarea
              ref={summaryRef}
              defaultValue={initialSummary}
              placeholder="请输入文章摘要..."
              rows={3}
              className="w-full px-4 py-2 text-gray-100 bg-gray-800 border border-gray-700 
                       rounded-lg focus:ring-2 focus:ring-purple-500 
                       focus:border-transparent outline-none transition-colors resize-none"
            />
            <div ref={editorRef} className="mt-4 bg-gray-800 rounded-lg overflow-hidden"></div>
          </div>

          {/* 右侧：封面、标签、布局 */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  文章封面
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg 
                           hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  选择图片
                </label>
              </div>
              {previewUrl ? (
                <div className="relative h-32 mb-2">
                  <img
                    src={previewUrl}
                    alt="封面预览"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setCover('');
                      setPreviewUrl('');
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full 
                             text-white flex items-center justify-center
                             hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="h-32 bg-gray-700 rounded-lg flex items-center justify-center mb-2">
                  <div className="text-gray-400 text-center">
                    <i className="fas fa-image text-2xl mb-1"></i>
                    <p className="text-sm">暂无封面</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                文章标签
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-600 text-white rounded-full text-sm
                             flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="w-4 h-4 flex items-center justify-center hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="输入标签后按回车添加..."
                  className="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 
                           text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 
                           focus:border-transparent outline-none transition-colors text-sm"
                />
                <button
                  onClick={handleTagAdd}
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg 
                           hover:bg-purple-700 transition-colors"
                >
                  添加
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  布局方式
                </label>
                <select
                  value={layout}
                  onChange={e => setLayout(e.target.value as 'single' | 'two-column')}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 
                           text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 
                           focus:border-transparent outline-none transition-colors text-sm"
                >
                  <option value="single">单栏布局</option>
                  <option value="two-column">双栏布局</option>
                </select>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  文章类型
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as 'article' | 'note' | 'tutorial')}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 
                           text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 
                           focus:border-transparent outline-none transition-colors text-sm"
                >
                  <option value="article">文章</option>
                  <option value="note">笔记</option>
                  <option value="tutorial">教程</option>
                </select>
              </div>
            </div>

            {/* AI 辅助写作区域（预留） */}
            <div className="p-4 bg-gray-800 rounded-lg opacity-50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  AI 辅助写作
                </label>
                <span className="text-xs text-gray-400">即将推出</span>
              </div>
              <button
                disabled
                className="w-full px-3 py-2 bg-gray-700 text-gray-400 rounded-lg 
                         text-sm flex items-center justify-center gap-2"
              >
                <i className="fas fa-robot"></i>
                AI 智能创作
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor; 