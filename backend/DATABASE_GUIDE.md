# 数据库查看指南

## 如何查看 PostgreSQL 数据库数据

### 方法 1: 使用 Prisma Studio（推荐 - 最简单）

Prisma Studio 是一个可视化数据库管理工具。

```bash
cd backend

# 启动 Prisma Studio
npx prisma studio
```

这会在浏览器中打开 `http://localhost:5555`，你可以：

- 查看所有表和数据
- 编辑数据
- 添加新记录
- 删除记录
- 执行简单查询

### 方法 2: 使用 psql 命令行

```bash
# 连接到数据库
psql -h localhost -U sales -d sales_mvp

# 常用命令
\dt                    # 列出所有表
\d tablename          # 查看表结构
SELECT * FROM "User"; # 查询用户表
SELECT * FROM "SalesOrder"; # 查询订单表
SELECT * FROM "Store";      # 查询门店表
\q                    # 退出
```

### 方法 3: 使用 VS Code 扩展

安装 PostgreSQL 扩展：

1. 打开 VS Code 扩展市场
2. 搜索 "PostgreSQL" 或 "Database Client"
3. 安装 "PostgreSQL" by Chris Kolkman 或 "Database Client" by Weijan Chen

连接信息：

- Host: localhost
- Port: 5432
- Database: sales_mvp
- Username: sales
- Password: (查看 .env 文件)

### 方法 4: 使用 DBeaver（专业工具）

1. 下载 DBeaver: https://dbeaver.io/
2. 创建新连接 → PostgreSQL
3. 输入连接信息（同上）
4. 测试连接并保存

### 方法 5: 使用 pgAdmin

1. 下载 pgAdmin: https://www.pgadmin.org/
2. 添加新服务器
3. 输入连接信息
4. 浏览数据库

## 常用 SQL 查询

### 查看所有用户

```sql
SELECT * FROM "User";
```

### 查看所有订单及关联信息

```sql
SELECT
  o."id",
  o."orderDate",
  o."totalAmount",
  o."totalQty",
  s."name" as "storeName",
  u."name" as "createdBy"
FROM "SalesOrder" o
LEFT JOIN "Store" s ON o."storeId" = s."id"
LEFT JOIN "User" u ON o."createdByUserId" = u."id"
ORDER BY o."orderDate" DESC;
```

### 查看订单明细

```sql
SELECT
  ol."id",
  o."id" as "orderId",
  p."name" as "productName",
  ol."qty",
  ol."unitPrice",
  ol."lineAmount"
FROM "SalesOrderLine" ol
LEFT JOIN "SalesOrder" o ON ol."orderId" = o."id"
LEFT JOIN "Product" p ON ol."productId" = p."id"
WHERE o."id" = 'your-order-id-here';
```

### 查看门店及其区域

```sql
SELECT
  s."name" as "storeName",
  r."name" as "regionName",
  s."address"
FROM "Store" s
LEFT JOIN "Region" r ON s."regionId" = r."id";
```

### 查看拜访记录

```sql
SELECT
  v."visitTime",
  s."name" as "storeName",
  u."name" as "visitor",
  v."result",
  v."notes"
FROM "Visit" v
LEFT JOIN "Store" s ON v."storeId" = s."id"
LEFT JOIN "User" u ON v."visitorUserId" = u."id"
ORDER BY v."visitTime" DESC;
```

### 统计数据

```sql
-- 每个用户的订单数量和总金额
SELECT
  u."name",
  COUNT(o."id") as "orderCount",
  SUM(o."totalAmount") as "totalSales"
FROM "User" u
LEFT JOIN "SalesOrder" o ON u."id" = o."createdByUserId"
GROUP BY u."id", u."name";

-- 最畅销的商品
SELECT
  p."name",
  SUM(ol."qty") as "totalQty",
  SUM(ol."lineAmount") as "totalRevenue"
FROM "Product" p
LEFT JOIN "SalesOrderLine" ol ON p."id" = ol."productId"
GROUP BY p."id", p."name"
ORDER BY "totalQty" DESC
LIMIT 10;

-- 每个门店的订单统计
SELECT
  s."name" as "storeName",
  COUNT(o."id") as "orderCount",
  SUM(o."totalAmount") as "totalSales"
FROM "Store" s
LEFT JOIN "SalesOrder" o ON s."id" = o."storeId"
GROUP BY s."id", s."name"
ORDER BY "totalSales" DESC;
```

## 数据库备份与恢复

### 备份数据库

```bash
# 备份整个数据库
pg_dump -h localhost -U sales sales_mvp > backup_$(date +%Y%m%d).sql

# 只备份数据（不含表结构）
pg_dump -h localhost -U sales --data-only sales_mvp > data_backup.sql

# 只备份表结构
pg_dump -h localhost -U sales --schema-only sales_mvp > schema_backup.sql
```

### 恢复数据库

```bash
# 恢复整个数据库
psql -h localhost -U sales sales_mvp < backup_20260508.sql

# 恢复特定表
psql -h localhost -U sales -d sales_mvp -c "DELETE FROM \"SalesOrder\";"
psql -h localhost -U sales sales_mvp < data_backup.sql
```

## 重置数据库

### 方法 1: 使用 Prisma

```bash
cd backend

# 重置数据库（删除所有数据并重新创建表）
npx prisma migrate reset

# 这会：
# 1. 删除数据库
# 2. 重新创建数据库
# 3. 运行所有迁移
# 4. 运行 seed 脚本
```

### 方法 2: 手动删除所有数据

```sql
-- 删除所有数据（保留表结构）
TRUNCATE TABLE "SalesOrderLine" CASCADE;
TRUNCATE TABLE "SalesOrder" CASCADE;
TRUNCATE TABLE "Visit" CASCADE;
TRUNCATE TABLE "Customer" CASCADE;
TRUNCATE TABLE "Product" CASCADE;
TRUNCATE TABLE "Store" CASCADE;
TRUNCATE TABLE "Region" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- 然后重新运行 seed
```

```bash
npm run prisma:seed
```

## 数据库连接字符串格式

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA

# 示例
postgresql://sales:password@localhost:5432/sales_mvp?schema=public
```

## 环境变量配置

在 `backend/.env` 文件中：

```env
DATABASE_URL="postgresql://sales:password@localhost:5432/sales_mvp"
```

## 常见问题

### Q: 无法连接数据库

A: 检查：

1. PostgreSQL 服务是否运行
2. 端口是否正确（默认 5432）
3. 用户名和密码是否正确
4. 数据库是否已创建

### Q: 表不存在

A: 运行迁移：

```bash
cd backend
npx prisma migrate dev
```

### Q: 数据为空

A: 运行 seed 脚本：

```bash
npm run prisma:seed
```

### Q: 权限错误

A: 确保数据库用户有足够的权限：

```sql
GRANT ALL PRIVILEGES ON DATABASE sales_mvp TO sales;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sales;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sales;
```

## 监控数据库

### 查看活动连接

```sql
SELECT * FROM pg_stat_activity
WHERE datname = 'sales_mvp';
```

### 查看表大小

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 查看最近的查询

```sql
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## 数据导出

### 导出为 CSV

```sql
COPY (SELECT * FROM "SalesOrder") TO '/tmp/orders.csv' CSV HEADER;
```

### 导出为 JSON（使用 psql）

```bash
psql -h localhost -U sales -d sales_mvp -c "SELECT row_to_json(t) FROM (SELECT * FROM \"SalesOrder\") t;" > orders.json
```

## 总结

**推荐新手使用**: Prisma Studio（最简单，可视化）
**推荐开发者使用**: VS Code PostgreSQL 扩展 或 DBeaver
**推荐运维使用**: pgAdmin 或命令行 psql

现在你可以轻松查看和管理数据库中的所有数据了！
