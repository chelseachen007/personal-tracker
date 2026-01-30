# 🚀 Linux 部署指南

## 快速部署

### 1. 安装 Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. 部署应用

```bash
# 进入项目目录
cd personal-tracker

# 运行部署脚本
./deploy-linux.sh
```

部署脚本会自动：
- 检查 Docker 环境
- 创建必要目录
- 生成安全密钥
- 构建并启动服务

### 3. 访问应用

| 服务 | 地址 |
|------|------|
| 前端 | http://YOUR_SERVER_IP:3000 |
| 后端 | http://YOUR_SERVER_IP:3001 |
| API 文档 | http://YOUR_SERVER_IP:3001/docs |

## 手动部署

如果自动脚本失败，可以手动部署：

```bash
# 1. 复制环境变量文件
cp .env.example .env

# 2. 编辑 .env，设置 JWT_SECRET
nano .env

# 3. 创建数据库目录
mkdir -p database

# 4. 构建并启动
docker-compose up -d --build

# 5. 查看日志
docker-compose logs -f
```

## 环境变量

编辑 `.env` 文件配置：

```bash
# JWT 密钥 (必须修改!)
JWT_SECRET=your-secure-random-key-here

# API 地址 (前端使用)
API_BASE_URL=http://YOUR_SERVER_IP:3001
```

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 只看后端日志
docker-compose logs -f backend

# 只看前端日志
docker-compose logs -f frontend

# 重新构建
docker-compose up -d --build
```

## 防火墙配置

**Ubuntu (ufw):**
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
```

**CentOS (firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

## 数据备份

```bash
# 备份数据库
cp database/tracker.db database/tracker.backup.$(date +%Y%m%d).db

# 恢复数据库
cp database/tracker.backup.20250130.db database/tracker.db
docker-compose restart backend
```

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs frontend

# 检查端口占用
sudo lsof -i :3000
sudo lsof -i :3001
```

### 数据库问题

```bash
# 重新初始化数据库
docker-compose down
rm -rf database/*
docker-compose up -d
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 生产环境建议

1. **修改 JWT_SECRET** 为强随机密钥
2. **配置 HTTPS** 使用 Nginx 反向代理
3. **定期备份数据库**
4. **设置防火墙规则**
5. **使用域名** 替代 IP 地址

## Nginx 反向代理 (可选)

```nginx
# /etc/nginx/sites-available/personal-tracker

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
