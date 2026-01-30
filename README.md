# 📊 Personal Tracker - 个人数据管理系统

一个功能完整的个人数据管理系统，用于追踪健康、餐饮、运动和财务数据。

## ✨ 功能特性

- 💪 **健康追踪** - 体重、身高、血压、心率记录
- 🍽️ **餐饮记录** - 每日餐食、卡路里、营养素追踪
- 🏃 **运动管理** - 运动类型、时长、距离、卡路里消耗
- 💰 **财务管理** - 收支记录、分类统计、预算追踪
- 🎯 **目标设定** - 设定并追踪个人目标进度
- 📈 **数据可视化** - 直观的图表和统计信息
- 🌙 **暗色模式** - 支持亮色/暗色主题切换
- 📱 **响应式设计** - 完美支持桌面端和移动端

## 🛠 技术栈

### 后端
- **Node.js** + **Fastify** - 高性能 Web 框架
- **Prisma** - 类型安全的 ORM
- **SQLite** - 轻量级数据库（可轻松切换至 PostgreSQL）
- **JWT** - 身份认证
- **Swagger** - API 文档自动生成

### 前端
- **Vue 3** + **Nuxt 3** - 现代化前端框架
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Pinia** - Vue 状态管理
- **Axios** - HTTP 客户端
- **Chart.js** - 数据可视化

## 🚀 快速开始

### 方式一：Docker Compose（推荐）

1. 克隆项目
```bash
git clone <your-repo-url>
cd personal-tracker
```

2. 启动服务
```bash
docker-compose up -d
```

3. 访问应用
- 前端: http://localhost:3000
- 后端 API: http://localhost:3001
- API 文档: http://localhost:3001/docs

### 方式二：本地开发

#### 后端设置

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 初始化数据库
```bash
npm run prisma:migrate
npm run prisma:generate
```

4. 启动开发服务器
```bash
npm run dev
```

#### 前端设置

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量（如需要）
```bash
# 默认连接到 localhost:3001
# 如需修改，在 .env 中设置：
NUXT_PUBLIC_API_BASE_URL=http://your-backend-url
```

4. 启动开发服务器
```bash
npm run dev
```

## 📂 项目结构

```
personal-tracker/
├── backend/                 # 后端服务
│   ├── src/
│   │   └── server.js      # 主服务器文件
│   ├── prisma/
│   │   └── schema.prisma  # 数据库模型
│   └── package.json
├── frontend/               # 前端应用
│   ├── pages/             # 页面组件
│   │   ├── index.vue      # 仪表盘
│   │   ├── health/        # 健康页面
│   │   ├── meals/         # 餐饮页面
│   │   ├── exercise/      # 运动页面
│   │   ├── finance/       # 财务页面
│   │   └── goals/         # 目标页面
│   ├── composables/       # 组合式函数
│   ├── stores/            # Pinia 状态管理
│   └── package.json
├── database/              # 数据库文件
├── docker-compose.yml     # Docker 编排配置
└── README.md
```

## 🔧 API 文档

启动后端服务后，访问 http://localhost:3001/docs 查看 Swagger API 文档。

主要 API 端点：

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 健康记录
- `GET /api/health` - 获取健康记录
- `POST /api/health` - 创建健康记录
- `DELETE /api/health/:id` - 删除记录

### 餐饮记录
- `GET /api/meals` - 获取餐饮记录
- `POST /api/meals` - 创建餐饮记录

### 运动记录
- `GET /api/exercises` - 获取运动记录
- `POST /api/exercises` - 创建运动记录

### 财务记录
- `GET /api/finances` - 获取财务记录
- `POST /api/finances` - 创建财务记录

### 目标管理
- `GET /api/goals` - 获取目标列表
- `POST /api/goals` - 创建目标

## 🔒 安全建议

生产环境部署前，请务必：

1. 修改 JWT_SECRET 为强随机密钥
2. 使用 HTTPS
3. 配置 CORS 白名单
4. 考虑使用 PostgreSQL 替代 SQLite
5. 设置数据库定期备份
6. 添加速率限制
7. 启用请求日志

## ✨ 当前状态

**✅ 项目开发已完成！**

查看 [COMPLETED.md](./COMPLETED.md) 了解所有已实现功能的详细说明。

### 核心功能
- 完整的 CRUD 操作（增删改查）
- JWT 认证系统
- 数据统计分析
- 目标进度追踪
- 数据导出功能
- 响应式设计
- 暗色模式支持

### 技术栈
- **后端**: Fastify + Prisma + SQLite
- **前端**: Nuxt 3 + Vue 3 + Tailwind CSS
- **部署**: Docker + Docker Compose

## 📦 数据备份

### SQLite 备份

```bash
# 备份数据库
cp database/tracker.db database/tracker.backup.$(date +%Y%m%d).db

# 恢复数据库
cp database/tracker.backup.20240130.db database/tracker.db
```

### 自动备份脚本

创建 `scripts/backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
mkdir -p $BACKUP_DIR
cp /path/to/database/tracker.db $BACKUP_DIR/tracker.backup.$(date +%Y%m%d_%H%M%S).db
# 保留最近7天的备份
find $BACKUP_DIR -name "tracker.backup.*.db" -mtime +7 -delete
```

## 🎨 自定义

### 修改主题颜色

编辑 `frontend/tailwind.config.js` 自定义颜色方案。

### 添加新的数据类型

1. 修改 `backend/prisma/schema.prisma` 添加新模型
2. 运行 `npm run prisma:migrate` 生成迁移
3. 在 `backend/src/server.js` 添加新的 API 路由
4. 在前端创建对应的页面和组件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Fastify](https://fastify.dev/) - 高性能 Node.js Web 框架
- [Prisma](https://www.prisma.io/) - 下一代 Node.js ORM
- [Nuxt](https://nuxt.com/) - Vue.js 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

**开始追踪你的数据吧！** 🚀
