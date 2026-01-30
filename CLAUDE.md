# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Personal Tracker 是一个全栈个人数据管理系统，用于追踪健康、餐饮、运动和财务数据。采用前后端分离架构，后端使用 Fastify + Prisma + SQLite，前端使用 Nuxt 3 + Vue 3 + Tailwind CSS。

## 开发命令

### Docker 方式（推荐）
```bash
./start.sh                    # 启动所有服务
docker-compose up -d          # 后台启动
docker-compose down           # 停止服务
docker-compose logs -f        # 查看日志
docker-compose up -d --build  # 重新构建并启动
```

### 后端本地开发
```bash
cd backend
npm install
npm run prisma:migrate        # 创建/迁移数据库
npm run prisma:generate       # 生成 Prisma Client
npm run dev                   # 启动开发服务器（带 --watch）
npm run start                 # 生产模式启动
npm run prisma:studio         # 打开 Prisma Studio 数据库管理界面
```

### 前端本地开发
```bash
cd frontend
npm install
npm run dev                   # 启动开发服务器
npm run build                 # 构建生产版本
npm run generate              # 静态站点生成
npm run preview               # 预览生产构建
```

## 架构说明

### 后端架构

**单文件服务器设计** - 所有后端逻辑位于 `backend/src/server.js`:
- Fastify 服务器实例，监听端口 3001
- JWT 认证中间件（`authenticate` 函数）用于保护路由
- Prisma Client 用于数据库操作
- Swagger 文档自动生成，访问 `/docs` 查看

**认证流程**:
1. 用户注册/登录 → 返回 JWT token
2. 客户端存储 token 到 localStorage
3. 受保护路由通过 `onRequest: [authenticate]` 验证 token
4. `request.user.userId` 提取当前用户 ID

**数据隔离**: 所有查询通过 `userId` 过滤，确保用户只能访问自己的数据。

**API 端点模式**:
- `GET /api/{resource}` - 列表查询，支持 `startDate`/`endDate` 过滤
- `POST /api/{resource}` - 创建记录
- `PUT /api/{resource}/:id` - 更新记录
- `DELETE /api/{resource}/:id` - 删除记录
- 每个资源都有相应的统计/汇总端点（如 `/api/health/stats`）

### 前端架构

**Nuxt 3 目录结构**:
- `pages/` - 文件路由系统，`pages/health/index.vue` → `/health`
- `composables/useApi.ts` - 统一的 API 调用封装，自动注入 JWT token
- `stores/auth.ts` - Pinia 认证状态管理，支持 localStorage 持久化
- 使用 `@nuxtjs/color-mode` 实现暗色模式

**useApi composable**:
- 所有 API 调用通过此 composable，自动添加 Authorization 头
- 包含完整的 CRUD 方法（get、create、update、delete）
- 统计端点方法（如 `getHealthStats`、`getFinanceSummary`）

**认证状态流**:
1. 登录成功 → token 存储到 Pinia store + localStorage
2. `useApi` 从 store 读取 token
3. 页面刷新时通过 `loadFromStorage()` 恢复登录状态

### 数据库

**Prisma Schema** (`backend/prisma/schema.prisma`):
- SQLite 数据库文件位于 `database/tracker.db`
- 所有模型通过 `userId` 关联到 `User`
- `onDelete: Cascade` 确保用户删除时级联删除关联记录
- 复合索引优化查询性能（如 `@@index([userId, recordDate])`）

**数据模型**:
- `User` - 用户账户
- `HealthRecord` - 体重、身高、血压、心率
- `MealRecord` - 餐食记录（卡路里、营养素）
- `ExerciseRecord` - 运动记录（类型、时长、卡路里）
- `FinanceRecord` - 收支记录
- `Goal` - 目标管理（进度追踪）

## 环境变量

**后端** (`backend/.env`):
```
JWT_SECRET=your-secret-key-change-in-production
```

**前端** (`frontend/.env` 或 `NUXT_PUBLIC_API_BASE_URL`):
```
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 数据库操作

修改数据模型后：
```bash
cd backend
npx prisma migrate dev --name describe_change  # 创建迁移
npx prisma generate                             # 重新生成 Prisma Client
```

## 重要约定

1. **所有 API 更改必须同步**: 后端修改 `server.js` 后，前端 `composables/useApi.ts` 需要相应更新
2. **日期格式**: 前端发送 ISO 字符串，后端 `new Date()` 转换
3. **用户数据隔离**: 永远使用 `request.user.userId` 过滤数据，不要信任请求体中的 userId
4. **认证**: 所有需要认证的路由必须添加 `{ onRequest: [authenticate] }`
5. **错误处理**: 后端使用 `reply.code(status).send({ error: 'message' })` 格式

## 服务端口

- 前端: http://localhost:3000
- 后端: http://localhost:3001
- API 文档: http://localhost:3001/docs
