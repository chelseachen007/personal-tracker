# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Personal Tracker 是一个全栈个人数据管理系统，用于追踪健康、餐饮、运动、财务、睡眠和心情数据。采用前后端分离架构，后端使用 Fastify + Prisma + SQLite，前端使用 Nuxt 3 + Vue 3 + Tailwind CSS。

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

### 后端架构（模块化设计）

**目录结构** - 后端已按功能模块拆分：
```
backend/src/
├── server.js           # 主服务器入口（约140行）
├── routes/             # 路由模块目录
│   ├── auth.js         # 认证路由（register, login, me）
│   ├── health.js       # 健康记录路由
│   ├── sleep.js        # 睡眠记录路由
│   ├── mood.js         # 心情记录路由
│   ├── meals.js        # 餐食记录路由
│   ├── exercises.js    # 运动记录路由
│   ├── finances.js     # 财务记录路由
│   ├── goals.js        # 目标管理路由
│   ├── exercisePlans.js # 运动计划与装备路由
│   ├── exports.js      # 数据导出路由
│   ├── ai.js           # AI 与 OCR 识别路由
│   ├── analytics.js    # 分析与搜索路由
│   └── food.js         # 食物数据库路由
├── analytics.js        # 跨模块数据分析服务
├── ocr.js             # OCR 文字识别服务
├── foodDatabase.js    # Open Food Facts 集成
├── ai/
│   ├── foodRecognition.js    # AI 食物识别
│   └── financeRecognition.js # AI 财务识别
└── utils/
    ├── export.js             # Excel/CSV 导出服务
    └── fileImport.js         # KML/GPX/TCX 文件导入
```

**认证流程**:
1. 开发模式下认证禁用，`userId` 默认为 1
2. 生产环境通过 JWT token 认证
3. 通过 `request.user.userId` 获取当前用户 ID

**数据隔离**: 所有查询通过 `userId` 过滤，确保用户只能访问自己的数据。

**API 约定** - 重要：
- **更新/删除操作**：`id` 通过请求体传递，不是路径参数
- `PUT /api/{resource}` - 更新，`id` 在请求体中
- `DELETE /api/{resource}` - 删除，`id` 在请求体中
- `GET /api/{resource}/xxx?id=xxx` - 查询，`id` 通过查询参数传递
- `GET /api/{resource}` - 列表查询，支持 `startDate`/`endDate` 过滤
- `POST /api/{resource}` - 创建记录

### 前端架构

**Nuxt 3 目录结构**:
- `pages/` - 文件路由系统，`pages/health/index.vue` → `/health`
- `composables/useApi.ts` - 统一的 API 调用封装，自动注入 JWT token
- `composables/useExport.ts` - 数据导出功能
- `stores/auth.ts` - Pinia 认证状态管理，支持 localStorage 持久化
- `components/` - 可复用组件（AgDataTable, ExerciseImport, GlobalSearch 等）
- 使用 `@nuxtjs/color-mode` 实现暗色模式

**useApi composable**:
- 所有 API 调用通过此 composable，自动添加 Authorization 头
- 使用 `${config.public.apiBase}` 确保调用正确的后端地址
- 包含完整的 CRUD 方法和统计端点方法
- 401 错误自动处理，显示登录提示对话框

### 数据库

**Prisma Schema** (`backend/prisma/schema.prisma`):
- SQLite 数据库文件位于 `backend/database/tracker.db`
- 所有模型通过 `userId` 关联到 `User`
- `onDelete: Cascade` 确保用户删除时级联删除关联记录

**数据模型**:
- `User` - 用户账户
- `HealthRecord` - 体重、身高、血压、心率
- `MealRecord` - 餐食记录（关联 FoodItem）
- `ExerciseRecord` - 运动记录（关联 ExercisePlan、Equipment）
- `FinanceRecord` - 收支记录
- `Goal` - 目标管理
- `ExercisePlan` - 运动计划
- `Equipment` - 装备管理
- `FoodItem` - 食物数据库
- `SleepRecord` - 睡眠记录
- `MoodRecord` - 心情记录

## 环境变量

**后端** (`backend/.env`):
```
JWT_SECRET=your-secret-key-change-in-production
```

**前端** (`frontend/.env`):
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

1. **API 同步**: 后端路由模块修改后，前端 `composables/useApi.ts` 需要相应更新
2. **日期格式**: 前端发送 ISO 字符串，后端 `new Date()` 转换
3. **用户数据隔离**: 永远使用 `request.user.userId` 过滤数据，不要信任请求体中的 userId
4. **认证**: 开发模式认证禁用（`isDev` 检查），生产环境通过 JWT
5. **错误处理**: 后端使用 `reply.code(status).send({ error: 'message' })` 格式
6. **id 参数**: 更新/删除操作将 `id` 放在请求体中，不是路径参数
7. **批量操作**: 使用 `/api/batch-delete`，body: `{ type, ids: [] }`

## 服务端口

- 前端: http://localhost:3000
- 后端: http://localhost:3001
- API 文档: http://localhost:3001/docs

## 已实现功能

### 核心功能模块
- 健康追踪（体重、血压、心率）
- 餐饮记录（关联食物数据库）
- 运动管理（轨迹导入、配速、海拔数据）
- 财务管理（收支分类、统计）
- 目标设定与进度追踪
- 睡眠记录（质量、时长、醒来/入睡时间）
- 心情记录（情绪、精力、压力）

### 高级功能
- **食物数据库**：集成 Open Food Facts API，支持条码扫描
- **AI 识别**：食物图片识别（GLM API）、财务截图识别
- **OCR 文字识别**：通用文字识别，用于单据识别
- **文件导入**：支持 KML/GPX/TCX 运动文件导入
- **数据导出**：Excel/CSV 格式导出
- **全局搜索**：跨模块搜索所有记录
- **数据分析**：卡路里平衡、睡眠-运动关联、健康评分、情绪化行为检测

### UI 组件
- `AgDataTable.vue` - AG Grid 数据表格组件（支持批量操作、导出）
- `GlobalSearch.vue` - 全局搜索组件（Cmd+K 快捷键）
- `ExerciseImport.vue` - 运动文件导入组件（支持地图展示）
- `BarcodeScanner.vue` - 条码扫描组件
