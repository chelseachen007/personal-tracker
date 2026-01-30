# 🎯 快速开始指南

## 方式一：Docker（最简单）

```bash
# 1. 进入项目目录
cd personal-tracker

# 2. 启动服务
./start.sh

# 或者手动运行
docker-compose up -d

# 3. 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:3001
# API 文档: http://localhost:3001/docs
```

## 方式二：本地开发

### 后端启动

```bash
cd backend

# 安装依赖
npm install

# 初始化数据库
npm run prisma:migrate
npm run prisma:generate

# 启动服务
npm run dev
```

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动服务
npm run dev
```

访问 http://localhost:3000 开始使用！

## 第一次使用

1. 在登录页面点击 "Register" 创建账号
2. 输入用户名和密码
3. 开始记录你的数据！

## 停止服务

```bash
# Docker 方式
docker-compose down

# 本地开发方式
# 按 Ctrl+C 停止服务
```

## 查看日志

```bash
# Docker 方式
docker-compose logs -f

# 只看前端
docker-compose logs -f frontend

# 只看后端
docker-compose logs -f backend
```

## 常见问题

### 端口被占用

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "3002:3001"  # 改为其他端口
```

### 数据库重置

```bash
# Docker 方式
docker-compose down -v
rm -rf database/*
docker-compose up -d
```

### 重新构建

```bash
docker-compose down
docker-compose up -d --build
```
