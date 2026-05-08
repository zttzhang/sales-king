# 腾讯云部署指南

本文档详细说明如何将销售管理系统部署到腾讯云服务器。

## 📋 部署前准备

### 1. 腾讯云资源清单

- ✅ **云服务器 CVM**（推荐配置：2核4GB，Ubuntu 22.04 LTS）
- ✅ **云数据库 PostgreSQL**（可选，也可使用Docker部署）
- ✅ **域名**（已备案）
- ✅ **SSL证书**（免费或付费）
- ✅ **安全组配置**（开放80、443、22端口）

### 2. 本地准备

- Docker 和 Docker Compose
- Git
- SSH 客户端

---

## 🚀 部署方案选择

### 方案一：轻量级部署（推荐新手）

**适用场景**：小团队、测试环境、MVP验证

- 1台云服务器（2核4GB）
- Docker Compose 一键部署
- 所有服务运行在同一服务器

**成本**：约 ¥100-200/月

### 方案二：生产级部署（推荐正式环境）

**适用场景**：正式生产环境、需要高可用

- 1台云服务器（应用服务器）
- 1个云数据库 PostgreSQL（托管服务）
- 负载均衡 CLB（可选）
- 对象存储 COS（可选，用于备份）

**成本**：约 ¥300-500/月

---

## 📦 方案一：轻量级部署（Docker Compose）

### 步骤1：购买并配置云服务器

1. **购买 CVM**
   - 登录[腾讯云控制台](https://console.cloud.tencent.com)
   - 选择"云服务器" → "实例" → "新建"
   - 配置：
     - 地域：选择离用户最近的地域（如：北京、上海、广州）
     - 机型：标准型 S5（2核4GB内存）
     - 镜像：Ubuntu Server 22.04 LTS 64位
     - 系统盘：50GB 高性能云硬盘
     - 数据盘：100GB 高性能云硬盘（用于数据库）
     - 网络：按流量计费或固定带宽（建议5Mbps）

2. **配置安全组**

   ```
   入站规则：
   - TCP:22   (SSH)     来源：你的IP地址（提高安全性）
   - TCP:80   (HTTP)    来源：0.0.0.0/0
   - TCP:443  (HTTPS)   来源：0.0.0.0/0

   出站规则：
   - 全部允许
   ```

3. **绑定弹性公网IP**
   - 如果没有公网IP，需要购买并绑定

### 步骤2：连接服务器并安装依赖

```bash
# SSH连接到服务器
ssh ubuntu@your-server-ip

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户加入docker组
sudo usermod -aG docker $USER

# 重新登录使权限生效
exit
ssh ubuntu@your-server-ip

# 验证安装
docker --version
docker-compose --version
```

### 步骤3：挂载数据盘

```bash
# 查看磁盘
lsblk

# 假设数据盘是 /dev/vdb，格式化并挂载
sudo mkfs.ext4 /dev/vdb
sudo mkdir -p /data
sudo mount /dev/vdb /data

# 设置开机自动挂载
echo '/dev/vdb /data ext4 defaults 0 0' | sudo tee -a /etc/fstab

# 创建数据目录
sudo mkdir -p /data/postgres
sudo mkdir -p /data/backups
sudo chown -R $USER:$USER /data
```

### 步骤4：上传代码到服务器

**方法A：使用 Git（推荐）**

```bash
# 在服务器上
cd ~
git clone https://github.com/your-username/sales-king.git
cd sales-king
```

**方法B：使用 SCP 上传**

```bash
# 在本地电脑上
cd c:\ma\sales-king
tar -czf sales-king.tar.gz backend/ nginx/ docker-compose.yml .env.example README.md
scp sales-king.tar.gz ubuntu@your-server-ip:~

# 在服务器上解压
ssh ubuntu@your-server-ip
tar -xzf sales-king.tar.gz
mv sales-king ~/sales-king
cd ~/sales-king
```

### 步骤5：配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

修改以下关键配置：

```env
# PostgreSQL 配置
POSTGRES_DB=sales_mvp
POSTGRES_USER=sales
POSTGRES_PASSWORD=YourStrongPassword123!@#  # ⚠️ 必须修改为强密码
POSTGRES_PORT=5432

# API 配置
API_PORT=3000
JWT_SECRET=your-random-jwt-secret-min-32-chars-long  # ⚠️ 必须修改为随机字符串
NODE_ENV=production

# 域名配置（如果有域名）
PUBLIC_BASE_URL=https://api.yourdomain.com

# 微信小程序配置（可选）
WX_APPID=your_wechat_appid
WX_SECRET=your_wechat_secret
```

**生成安全的 JWT_SECRET：**

```bash
# 生成随机字符串
openssl rand -base64 32
```

### 步骤6：配置 SSL 证书

**选项A：使用 Let's Encrypt 免费证书（推荐）**

```bash
# 安装 certbot
sudo apt install certbot -y

# 临时停止可能占用80端口的服务
sudo systemctl stop nginx 2>/dev/null || true

# 获取证书（需要先将域名A记录解析到服务器公网IP）
sudo certbot certonly --standalone -d api.yourdomain.com --email your-email@example.com --agree-tos

# 证书会保存在 /etc/letsencrypt/live/api.yourdomain.com/
# 复制证书到项目目录
sudo mkdir -p ~/sales-king/nginx/certs
sudo cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem ~/sales-king/nginx/certs/
sudo cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem ~/sales-king/nginx/certs/
sudo chown $USER:$USER ~/sales-king/nginx/certs/*

# 设置证书自动续期
echo "0 3 * * * root certbot renew --quiet && cp /etc/letsencrypt/live/api.yourdomain.com/*.pem ~/sales-king/nginx/certs/ && docker-compose -f ~/sales-king/docker-compose.yml restart nginx" | sudo tee -a /etc/crontab
```

**选项B：使用腾讯云SSL证书**

1. 登录[腾讯云SSL证书控制台](https://console.cloud.tencent.com/ssl)
2. 申请免费SSL证书（DV型，1年有效期）
3. 验证域名所有权（DNS验证或文件验证）
4. 下载证书（选择 Nginx 格式）
5. 上传到服务器：
   ```bash
   # 在本地（假设证书文件在下载目录）
   scp 1_api.yourdomain.com_bundle.crt ubuntu@your-server-ip:~/sales-king/nginx/certs/fullchain.pem
   scp 2_api.yourdomain.com.key ubuntu@your-server-ip:~/sales-king/nginx/certs/privkey.pem
   ```

**选项C：使用自签名证书（仅用于测试）**

```bash
# 生成自签名证书（不推荐生产环境）
mkdir -p ~/sales-king/nginx/certs
cd ~/sales-king/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=MyCompany/CN=api.yourdomain.com"
```

### 步骤7：修改 docker-compose.yml（使用数据盘）

```bash
nano docker-compose.yml
```

修改 postgres 卷配置：

```yaml
postgres:
  image: postgres:16-alpine
  container_name: sales-king-postgres
  environment:
    - POSTGRES_DB=${POSTGRES_DB}
    - POSTGRES_USER=${POSTGRES_USER}
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    - PGDATA=/var/lib/postgresql/data/pgdata
  volumes:
    - /data/postgres:/var/lib/postgresql/data # 使用数据盘
  ports:
    - "127.0.0.1:${POSTGRES_PORT:-5432}:5432"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
    interval: 10s
    timeout: 5s
    retries: 5
  restart: unless-stopped
  networks:
    - sales-king-network
```

### 步骤8：启动服务

```bash
cd ~/sales-king

# 构建并启动所有服务
docker-compose up -d --build

# 查看启动日志
docker-compose logs -f

# 等待所有服务启动完成（Ctrl+C 退出日志查看）

# 检查服务状态
docker-compose ps
```

预期输出：

```
NAME                    IMAGE                   STATUS              PORTS
sales-king-api          sales-king-api          Up 2 minutes        3000/tcp
sales-king-nginx        nginx:1.27-alpine       Up 2 minutes        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
sales-king-postgres     postgres:16-alpine      Up 2 minutes (healthy)   127.0.0.1:5432->5432/tcp
```

### 步骤9：初始化数据库

```bash
# 等待数据库完全启动（大约10-20秒）
sleep 20

# 进入 API 容器
docker-compose exec api sh

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 创建种子数据（包含默认管理员账号）
npm run prisma:seed

# 退出容器
exit
```

### 步骤10：验证部署

```bash
# 测试健康检查接口
curl http://localhost/health

# 如果配置了域名和SSL
curl https://api.yourdomain.com/health

# 测试登录接口
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

成功响应示例：

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "...",
    "username": "admin",
    "role": "admin",
    "displayName": "系统管理员"
  }
}
```

---

## 🔒 安全加固

### 1. 修改默认密码

```bash
# 方法A：使用 API 修改密码
curl -X PUT https://api.yourdomain.com/api/v1/users/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"admin123","newPassword":"NewStrongPassword123!@#"}'

# 方法B：直接修改数据库（需要bcrypt加密）
docker-compose exec api sh
npx ts-node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('NewPassword123', 10));"
# 复制输出的hash值，然后更新数据库
exit
```

### 2. 配置防火墙

```bash
# 安装 UFW
sudo apt install ufw -y

# 配置规则
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# 启用防火墙
sudo ufw --force enable
sudo ufw status numbered
```

### 3. 配置 Fail2ban（防止暴力破解）

```bash
sudo apt install fail2ban -y

# 配置 SSH 保护
sudo tee /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

### 4. 限制 SSH 访问

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 修改以下配置：
# PermitRootLogin no
# PasswordAuthentication no  # 建议使用密钥登录
# Port 22222  # 可选：更改SSH端
```
