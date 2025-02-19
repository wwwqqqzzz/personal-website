# 个人网站项目

这是一个使用现代Web技术栈构建的个人网站项目，包含前台展示和后台管理系统。

## 访问地址

- 前台展示：[http://localhost:4324](http://localhost:4324)
- 后台管理：[http://localhost:4324/admin](http://localhost:4324/admin)
- 项目仓库：[https://github.com/wwwqqqzzz/personal-website](https://github.com/wwwqqqzzz/personal-website)

开发环境默认运行在 4324 端口，可以通过环境变量 `PORT` 修改。

## 技术栈

### 前端
- 框架：Astro.js
- 样式：Tailwind CSS
- 动画：Three.js
- 图标：Font Awesome
- 状态管理：Zustand
- UI组件：Shadcn UI

### 后端
- 数据库：Supabase (PostgreSQL)
- 认证：JWT
- API：REST
- 存储：Supabase Storage

## 主要功能

### 前台
- 响应式设计
- 暗色主题
- 3D背景动画
- 技术栈展示
- 作品集展示
- 博客系统
- 玻璃态设计

### 后台
- 管理员认证
- 文章管理
- 分类管理
- 标签管理
- 媒体管理
- 数据统计

## 环境要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号

## 安装说明

1. 克隆仓库
```bash
git clone https://github.com/wwwqqqzzz/personal-website.git
cd personal-website
```

2. 环境配置
```bash
cp .env.example .env
```
然后在 `.env` 文件中填入你的 Supabase 配置信息

3. 安装依赖
```bash
cd project
npm install
```

4. 启动开发服务器
```bash
npm run dev
```

5. 构建项目
```bash
npm run build
```

## 项目结构

```
project/
├── src/
│   ├── components/    # 可复用组件
│   ├── layouts/       # 页面布局
│   ├── pages/         # 页面文件
│   │   ├── admin/    # 后台管理页面
│   │   ├── api/      # API 接口
│   │   └── tech/     # 技术栈页面
│   ├── lib/          # 工具库
│   ├── styles/       # 全局样式
│   ├── types/        # 类型定义
│   └── utils/        # 工具函数
├── public/           # 静态资源
└── package.json      # 项目配置
```

## 部署

1. 构建项目
```bash
npm run build
```

2. 部署到服务器或托管平台
```bash
# 示例：部署到 GitHub Pages
npm run deploy
```

## 开发计划

- [ ] 评论系统
- [ ] 文章搜索
- [ ] 数据统计图表
- [ ] 主题切换
- [ ] 国际化支持
- [ ] 性能优化

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

MIT License 