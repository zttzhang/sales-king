# 外勤拜访 & 销售记录系统（微信小程序 + Node API + PostgreSQL）MVP — VibeCoding 规格说明

> 目标：小团队外勤拜访外部门店，在拜访/销售过程中快速记录**门店、拜访、订单（头+明细）**数据，并提供“我的拜访/我的销售/Top门店&商品”的基础查询与统计。
>
> MVP 特点：
> - **不做图片/附件**（Visit 不含 Photos）
> - **不需要离线**
> - **不需要审批/对账**
> - **不需要对接外部系统**
> - 单机部署：**Docker Compose + Nginx + Node API + PostgreSQL（+Redis 可选）**

---

## 1. 范围（Scope）

### 1.1 角色（Roles）
- **销售人员（Sales）**：创建/查看自己创建的拜访与订单。
- **管理员（Admin）**：维护主数据（区域/门店/商品/客户），可查看所有数据。

> MVP 权限策略：
> - Sales 仅能访问 `CreatedBy = 自己` 的 Visit/Order。
> - Admin 全量可访问。
> - 后续扩展：按区域/门店授权（不在本 MVP）。

### 1.2 功能清单（MVP）

#### A) 主数据
1) 区域 Region：增删改查
2) 门店 Store：增删改查（包含 Region、地址、备注）
3) 商品 Product：增删改查（产品线、默认价可选）
4) 客户 Customer（可选）：增删改查（允许匿名/散客：CustomerId 为空）

#### B) 拜访 Visit
- 创建拜访：选择门店、拜访时间（默认当前）、结果（枚举）、备注
- 查询拜访：我的拜访（按日/周/月筛选），门店筛选

#### C) 订单 Sales Order（头+行）
- 创建订单头：日期（默认今天）、门店、客户（可空）、备注
- 编辑订单行：商品、数量、单价、促销（可选字段占位）、折扣金额（可选字段占位）
- 订单汇总：总金额、总件数（由订单行计算）
- 查询订单：我的订单（日期范围/门店/商品筛选），订单详情

#### D) 统计（简单报表 API）
- 我的拜访：今日/本周/本月 拜访次数、下单次数
- 我的销售：今日/本周/本月 销售额、订单数、销量（件数）
- Top：Top 门店、Top 商品（可选）

---

## 2. 非功能需求（NFR）

- **稳定性**：单机部署，支持每日备份。
- **性能**：典型并发 < 50；查询响应 < 500ms（数据量小）。
- **安全**：
  - 全站 HTTPS（Nginx TLS）
  - JWT 鉴权
  - 数据库不暴露公网
  - 基础限流（Nginx 或 API 层）
- **可运维**：日志、健康检查、监控（最少磁盘/内存告警）。

---

## 3. 技术架构

### 3.1 运行时组件
- **Nginx**：反向代理、TLS、静态资源（可选）
- **Node API**：NestJS（推荐）或 Express
- **PostgreSQL**：主数据 + 交易数据
- **Redis（可选）**：缓存、令牌黑名单、简单计数

### 3.2 推荐目录结构

```
repo/
  backend/
    src/
    prisma/ or migrations/
    package.json
    Dockerfile
  nginx/
    nginx.conf
    certs/ (生产建议挂载)
  docker-compose.yml
  .env.example
  docs/
    api.md
    schema.md
    runbook.md
```

---

## 4. 数据模型（ERD 文字版）

> 主键统一用 UUID（推荐）或自增 int（二选一，MVP 选 UUID 更易合并/迁移）。

### 4.1 主数据表

#### Region
- `region_id` (PK)
- `region_name` (unique)
- `created_at`
- `updated_at`

#### Store
- `store_id` (PK)
- `store_name`
- `region_id` (FK -> Region)
- `address`
- `notes`
- `created_at`
- `updated_at`

#### Product
- `product_id` (PK)
- `product_name`
- `product_line` (nullable)
- `default_price` (nullable)
- `created_at`
- `updated_at`

#### Customer（可选）
- `customer_id` (PK)
- `customer_name`
- `type` (nullable)
- `created_at`
- `updated_at`

### 4.2 过程数据表

#### User（MVP 内置用户表）
- `user_id` (PK)
- `role` ('admin' | 'sales')
- `display_name`
- `wx_openid` (unique, nullable)  // 若接入微信登录
- `created_at`
- `updated_at`

> 注：若暂不做微信 openid 体系，也可先用“账号密码”或“邀请码注册”。

#### Visit
- `visit_id` (PK)
- `store_id` (FK -> Store)
- `visit_time` (timestamp)
- `visitor_user_id` (FK -> User)
- `result` (enum: 'intent' | 'ordered' | 'no_order' | 'other')
- `notes` (text)
- `created_at`
- `updated_at`

#### SalesOrder
- `order_id` (PK)
- `store_id` (FK -> Store)
- `customer_id` (FK -> Customer, nullable)
- `order_date` (date)
- `created_by_user_id` (FK -> User)
- `notes` (text)
- `total_amount` (numeric(12,2))  // 可冗余存储，写入时计算
- `total_qty` (numeric(12,2))     // 可冗余存储，写入时计算
- `created_at`
- `updated_at`

#### SalesOrderLine
- `line_id` (PK)
- `order_id` (FK -> SalesOrder)
- `product_id` (FK -> Product)
- `qty` (numeric(12,2))
- `unit_price` (numeric(12,2))
- `promotion_id` (nullable)       // MVP 预留，可不建表
- `discount_amount` (numeric(12,2), default 0)
- `line_amount` (numeric(12,2))   // qty * unit_price - discount_amount
- `created_at`
- `updated_at`

### 4.3 必备索引（性能关键）
- Visit：`(visitor_user_id, visit_time)`、`(store_id, visit_time)`
- SalesOrder：`(created_by_user_id, order_date)`、`(store_id, order_date)`
- SalesOrderLine：`(order_id)`、`(product_id)`

---

## 5. API 设计（REST）

> 约定：
> - Base URL：`/api/v1`
> - 鉴权：`Authorization: Bearer <jwt>`
> - 时间：ISO8601；金额/数量使用字符串或 number（前后端统一）

### 5.1 Auth

#### POST /auth/login
- MVP 方案一（推荐）：微信登录
  - 入参：`{ code }`（wx.login 返回）
  - 后端：调用 `jscode2session` 换取 openid/session_key；查找/创建用户；签发 JWT
- MVP 方案二：账号密码（更快落地）
  - 入参：`{ username, password }`

返回：`{ token, user: { userId, role, displayName } }`

#### GET /auth/me
返回当前用户信息

### 5.2 Master Data（Admin only for write）

#### Regions
- GET /regions
- POST /regions (admin)
- PUT /regions/:id (admin)
- DELETE /regions/:id (admin)

#### Stores
- GET /stores?keyword=&regionId=
- POST /stores (admin)
- PUT /stores/:id (admin)
- DELETE /stores/:id (admin)

#### Products
- GET /products?keyword=&productLine=
- POST /products (admin)
- PUT /products/:id (admin)
- DELETE /products/:id (admin)

#### Customers（可选）
- GET /customers?keyword=
- POST /customers (admin)
- PUT /customers/:id (admin)
- DELETE /customers/:id (admin)

### 5.3 Visit
- GET /visits?from=&to=&storeId=
  - Sales：仅返回自己的 visits
  - Admin：可返回所有（MVP）
- POST /visits
  - body：`{ storeId, visitTime, result, notes }`
- GET /visits/:id
- PUT /visits/:id
- DELETE /visits/:id

### 5.4 Sales Order

#### 订单头
- GET /orders?from=&to=&storeId=&productId=
- POST /orders
  - body：`{ storeId, customerId?, orderDate, notes?, lines: [...] }`
- GET /orders/:id
- PUT /orders/:id
- DELETE /orders/:id

#### 订单行（也可合并到订单 PUT）
- POST /orders/:id/lines
- PUT /orders/:id/lines/:lineId
- DELETE /orders/:id/lines/:lineId

> MVP 建议：**一次性提交订单头+明细 lines**，后端事务保存。

### 5.5 Stats

- GET /stats/my/visits?range=today|week|month
  - 返回：`{ visitsCount, orderedVisitsCount }`

- GET /stats/my/sales?range=today|week|month
  - 返回：`{ salesAmount, ordersCount, totalQty }`

- GET /stats/top/stores?range=month&limit=10
- GET /stats/top/products?range=month&limit=10

---

## 6. 业务规则（Business Rules）

1) 订单金额：
   - `line_amount = qty * unit_price - discount_amount`
   - `total_amount = sum(line_amount)`
   - `total_qty = sum(qty)`
2) 校验：
   - qty > 0
   - unit_price >= 0
   - discount_amount >= 0 且 <= qty*unit_price
3) 数据权限：
   - Sales 只能操作自己创建的 Visit/Order
4) 删除策略：MVP 可物理删除；生产建议软删除（`deleted_at`）。

---

## 7. 微信小程序前端（页面&交互）

### 7.1 页面列表（MVP）
1) 登录页（或启动时自动登录）
2) 首页 Dashboard：
   - 今日/本周/本月：拜访次数、下单次数、销售额、订单数、销量
3) 门店列表：搜索、按区域筛选
4) 门店详情：展示档案，快捷“新建拜访 / 新建订单”
5) 新建拜访：门店、结果、备注、时间
6) 订单列表：日期范围筛选、门店筛选
7) 新建订单：订单头 + 明细行编辑
8) 订单详情：查看头信息与行明细
9) 管理端（可隐藏入口，Admin 才显示）：区域/门店/商品/客户维护

### 7.2 交互要点
- 门店/商品选择：支持关键字搜索
- 订单行编辑：新增/删除行，实时计算总金额
- 表单保存：提交前本地校验；提交后显示成功 toast

---

## 8. Docker Compose（单机部署）

### 8.1 环境变量（.env 示例）

```
# Postgres
POSTGRES_DB=sales_mvp
POSTGRES_USER=sales
POSTGRES_PASSWORD=change_me
POSTGRES_PORT=5432

# API
API_PORT=3000
JWT_SECRET=change_me
NODE_ENV=production

# WeChat (可选)
WX_APPID=xxxx
WX_SECRET=xxxx

# Domain
PUBLIC_BASE_URL=https://api.example.com
```

### 8.2 docker-compose.yml（模板）

> 说明：
> - PostgreSQL 数据目录挂载到 `/data/postgres`（你需要把服务器数据盘挂载到 `/data`）
> - Nginx 负责 TLS 与反代

```yaml
services:
  nginx:
    image: nginx:1.27
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - api
    restart: unless-stopped

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - API_PORT=${API_PORT}
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=${NODE_ENV}
      - WX_APPID=${WX_APPID}
      - WX_SECRET=${WX_SECRET}
      - PUBLIC_BASE_URL=${PUBLIC_BASE_URL}
    expose:
      - "${API_PORT}"
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - /data/postgres:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:${POSTGRES_PORT}:5432" # 不暴露公网
    restart: unless-stopped

  # redis:  # 可选
  #   image: redis:7
  #   ports:
  #     - "127.0.0.1:6379:6379"
  #   restart: unless-stopped
```

### 8.3 Nginx 反代（nginx.conf 样例）

```nginx
events {}
http {
  server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    client_max_body_size 2m;

    location / {
      proxy_pass http://api:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
```

---

## 9. 数据库迁移与种子数据（Seed）

- 使用 Prisma（Node）或 TypeORM migrations。
- 提供 seed：
  - 默认 admin 用户
  - 示例 Region/Store/Product

---

## 10. 开发任务拆分（VibeCoding 用）

> 目标：把任务拆成可快速迭代的小块。

### Sprint 0（基础设施）
- [ ] 初始化仓库结构（backend/nginx/docs）
- [ ] Docker Compose 跑通（postgres + api + nginx）
- [ ] 健康检查接口：GET /health

### Sprint 1（主数据）
- [ ] Region CRUD + Admin 权限
- [ ] Store CRUD + 搜索/筛选
- [ ] Product CRUD + 搜索/筛选
- [ ] Customer CRUD（可选）

### Sprint 2（拜访 Visit）
- [ ] Visit 创建/列表/详情
- [ ] Sales 权限（只能看自己的）
- [ ] Stats：我的拜访（today/week/month）

### Sprint 3（订单 Order）
- [ ] 创建订单（头+行，事务）
- [ ] 订单列表（from/to/store/product 过滤）
- [ ] 订单详情
- [ ] Stats：我的销售（today/week/month）
- [ ] Top Stores / Top Products（可选）

### Sprint 4（小程序页面）
- [ ] 登录 & token 存储
- [ ] 首页 Dashboard
- [ ] 门店列表/详情
- [ ] 新建拜访
- [ ] 订单列表/新建订单/订单详情

---

## 11. 验收标准（Acceptance Criteria）

1) Sales 用户：
- 能创建拜访，并在“我的拜访”列表看到
- 能创建订单（含多条明细），自动计算金额与件数
- 只能看到/编辑自己创建的数据

2) Admin 用户：
- 能维护区域/门店/商品/客户
- 能看到所有销售人员提交的数据

3) 统计：
- 首页能显示今日/本周/本月：拜访次数、下单次数、销售额、订单数、销量

4) 部署：
- docker compose up 后，HTTPS 可访问 API（或测试环境先用 HTTP）
- PostgreSQL 数据落在 `/data/postgres`，重启容器数据不丢

---

## 12. 风险与建议

- **系统盘空间紧张**：建议加挂数据盘并将 `/data/postgres` 放数据盘。
- **微信登录实现**：需要 AppID/Secret 与域名白名单、HTTPS、备案等。
- **后续扩展**：按区域授权、图片、离线草稿、促销规则、库存/对接等。

---

## 13. VibeCoding Prompt（直接给 AI Coding Agent 的指令模板）

> 你可以把下面模板粘贴到 Cursor / Copilot Chat / Claude Code 等工具里。

### Prompt A：生成后端骨架（NestJS + Prisma + Postgres）

- 目标：实现本文件定义的 REST API（Auth/Regions/Stores/Products/Visits/Orders/Stats），使用 NestJS + Prisma，PostgreSQL。
- 约束：
  1) 所有写操作需要 JWT；Admin 写主数据；Sales 只能写自己的 Visit/Order。
  2) Orders 创建需要事务，写入 order 与 lines，并计算 total_amount/total_qty。
  3) Stats 接口按 today/week/month 聚合。
- 输出：
  - 完整 backend 项目结构
  - Prisma schema + migration
  - Dockerfile
  - 单元测试（至少 Orders total 计算与权限）

### Prompt B：生成小程序页面与 API 封装

- 目标：实现小程序页面：Dashboard、Stores（list/detail）、Visit create、Orders（list/create/detail），并封装 request 带 token。
- 约束：
  1) 表单校验：数量>0，折扣<=金额。
  2) 订单行编辑支持新增/删除，多行实时汇总。
  3) UI 朴素即可，优先可用性。

