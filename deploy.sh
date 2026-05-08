#!/bin/bash

# 销售管理系统 - 腾讯云快速部署脚本
# 使用方法: bash deploy.sh

set -e

echo "========================================="
echo "  销售管理系统 - 腾讯云部署脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}请不要使用root用户运行此脚本${NC}"
  echo "建议使用: sudo -u ubuntu bash deploy.sh"
  exit 1
fi

# 步骤1: 检查系统环境
echo -e "${GREEN}[1/10] 检查系统环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker 未安装，正在安装...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker 安装完成，请重新登录后再次运行此脚本${NC}"
    exit 0
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose 未安装，正在安装...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo -e "${GREEN}✓ Docker: $(docker --version)${NC}"
echo -e "${GREEN}✓ Docker Compose: $(docker-compose --version)${NC}"
echo ""

# 步骤2: 检查环境变量文件
echo -e "${GREEN}[2/10] 检查配置文件...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}未找到 .env 文件，从模板创建...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  请编辑 .env 文件，修改以下配置：${NC}"
    echo "  - POSTGRES_PASSWORD (数据库密码)"
    echo "  - JWT_SECRET (JWT密钥)"
    echo "  - PUBLIC_BASE_URL (API域名)"
    echo ""
    read -p "是否现在编辑 .env 文件? (y/n): " edit_env
    if [ "$edit_env" = "y" ]; then
        nano .env
    else
        echo -e "${RED}请手动编辑 .env 文件后再次运行此脚本${NC}"
        exit 1
    fi
fi

# 检查必要的环境变量
source .env
if [ "$POSTGRES_PASSWORD" = "change_me_in_production" ] || [ "$JWT_SECRET" = "change_me_to_random_string_in_production" ]; then
    echo -e "${RED}⚠️  检测到默认密码，请修改 .env 文件中的敏感信息！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 环境变量配置完成${NC}"
echo ""

# 步骤3: 检查SSL证书
echo -e "${GREEN}[3/10] 检查SSL证书...${NC}"
if [ ! -f nginx/certs/fullchain.pem ] || [ ! -f nginx/certs/privkey.pem ]; then
    echo -e "${YELLOW}未找到SSL证书${NC}"
    echo "请选择证书配置方式："
    echo "1) 使用 Let's Encrypt 免费证书（需要域名）"
    echo "2) 使用腾讯云SSL证书（手动上传）"
    echo "3) 生成自签名证书（仅测试用）"
    echo "4) 跳过（稍后手动配置）"
    read -p "请选择 (1-4): " cert_choice
    
    case $cert_choice in
        1)
            read -p "请输入域名（如 api.example.com）: " domain
            read -p "请输入邮箱: " email
            sudo apt install certbot -y
            sudo certbot certonly --standalone -d $domain --email $email --agree-tos
            sudo mkdir -p nginx/certs
            sudo cp /etc/letsencrypt/live/$domain/fullchain.pem nginx/certs/
            sudo cp /etc/letsencrypt/live/$domain/privkey.pem nginx/certs/
            sudo chown $USER:$USER nginx/certs/*
            echo -e "${GREEN}✓ Let's Encrypt 证书配置完成${NC}"
            ;;
        2)
            echo "请将证书文件上传到 nginx/certs/ 目录："
            echo "  - fullchain.pem (证书链文件)"
            echo "  - privkey.pem (私钥文件)"
            read -p "上传完成后按回车继续..."
            ;;
        3)
            mkdir -p nginx/certs
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
              -keyout nginx/certs/privkey.pem -out nginx/certs/fullchain.pem \
              -subj "/C=CN/ST=Beijing/L=Beijing/O=MyCompany/CN=localhost"
            echo -e "${YELLOW}⚠️  已生成自签名证书（仅用于测试）${NC}"
            ;;
        4)
            echo -e "${YELLOW}跳过SSL配置，请稍后手动配置${NC}"
            ;;
    esac
fi
echo ""

# 步骤4: 检查数据目录
echo -e "${GREEN}[4/10] 配置数据存储...${NC}"
if [ ! -d "/data" ]; then
    echo -e "${YELLOW}未找到 /data 目录${NC}"
    read -p "是否已挂载数据盘到 /data？(y/n): " has_data_disk
    if [ "$has_data_disk" = "n" ]; then
        echo "使用本地目录存储数据..."
        sudo mkdir -p /data/postgres /data/backups
        sudo chown -R $USER:$USER /data
    fi
else
    echo -e "${GREEN}✓ 数据目录已存在${NC}"
fi
echo ""

# 步骤5: 停止旧服务
echo -e "${GREEN}[5/10] 停止旧服务...${NC}"
if [ -f docker-compose.yml ]; then
    docker-compose down 2>/dev/null || true
fi
echo ""

# 步骤6: 构建镜像
echo -e "${GREEN}[6/10] 构建Docker镜像...${NC}"
docker-compose build
echo ""

# 步骤7: 启动服务
echo -e "${GREEN}[7/10] 启动服务...${NC}"
docker-compose up -d
echo ""

# 步骤8: 等待服务就绪
echo -e "${GREEN}[8/10] 等待服务启动...${NC}"
echo "等待数据库就绪..."
sleep 20

# 检查服务状态
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}✗ 服务启动失败，查看日志：${NC}"
    docker-compose logs
    exit 1
fi
echo -e "${GREEN}✓ 所有服务已启动${NC}"
echo ""

# 步骤9: 初始化数据库
echo -e "${GREEN}[9/10] 初始化数据库...${NC}"
echo "运行数据库迁移..."
docker-compose exec -T api npx prisma migrate deploy

echo "创建种子数据..."
docker-compose exec -T api npm run prisma:seed || echo "种子数据可能已存在"
echo ""

# 步骤10: 验证部署
echo -e "${GREEN}[10/10] 验证部署...${NC}"
echo "测试健康检查接口..."
sleep 5

if curl -s http://localhost/health | grep -q "ok"; then
    echo -e "${GREEN}✓ 健康检查通过${NC}"
else
    echo -e "${RED}✗ 健康检查失败${NC}"
    echo "查看日志："
    docker-compose logs api
    exit 1
fi

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "========================================="
echo -e "${GREEN}  部署完成！${NC}"
echo "========================================="
echo ""
echo "📊 服务状态:"
docker-compose ps
echo ""
echo "🌐 访问地址:"
echo "  - HTTP:  http://$SERVER_IP"
echo "  - HTTPS: https://$SERVER_IP"
if [ ! -z "$PUBLIC_BASE_URL" ]; then
    echo "  - 域名:  $PUBLIC_BASE_URL"
fi
echo ""
echo "🔐 默认账号:"
echo "  - 管理员: admin / admin123"
echo "  - 销售:   sales / sales123"
echo ""
echo "⚠️  重要提示:"
echo "  1. 请立即修改默认密码"
echo "  2. 配置防火墙: sudo ufw enable && sudo ufw allow 22,80,443/tcp"
echo "  3. 设置定时备份: crontab -e"
echo ""
echo "📝 常用命令:"
echo "  - 查看日志: docker-compose logs -f"
echo "  - 重启服务: docker-compose restart"
echo "  - 停止服务: docker-compose stop"
echo "  - 更新服务: git pull && docker-compose up -d --build"
echo ""
echo "📚 详细文档: DEPLOYMENT_TENCENT_CLOUD.md"
echo "========================================="