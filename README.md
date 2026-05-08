# Sales King - 外勤拜访 & 销售记录系统

Sales King is a sales visit and order management system for field sales teams. Built with NestJS, PostgreSQL, and designed for deployment with Docker.

## Features

- 🏪 **Store Management** - Manage stores by region
- 📦 **Product Catalog** - Maintain products with pricing
- 👥 **Customer Database** - Track customer information
- 🚶 **Visit Tracking** - Record store visits with outcomes
- 📝 **Order Management** - Create and manage sales orders with line items
- 📊 **Statistics** - View sales performance metrics
- 🔐 **Role-Based Access** - Admin and Sales user roles
- 🐳 **Docker Ready** - Complete Docker Compose setup

## Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: JWT
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd sales-king
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your settings:

```env
POSTGRES_DB=sales_mvp
POSTGRES_USER=sales
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

### 3. Start with Docker Compose

```bash
docker-compose up -d
```

This will start:

- PostgreSQL database
- NestJS API server
- Nginx reverse proxy

### 4. Run Database Migrations

```bash
docker-compose exec api npx prisma migrate deploy
```

### 5. Seed Initial Data

```bash
docker-compose exec api npm run prisma:seed
```

Default credentials:

- **Admin**: email=`admin@example.com`, password=`admin123`
- **Sales**: email=`sales@example.com`, password=`sales123`

### 6. Access the API

- **HTTP**: http://localhost/api
- **HTTPS**: https://localhost/api (requires SSL certificates)

## Development

### Local Development Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with database connection:

```env
DATABASE_URL="postgresql://sales:password@localhost:5432/sales_mvp"
JWT_SECRET="dev-secret"
```

### Run Migrations

```bash
npm run prisma:migrate
```

### Seed Database

```bash
npm run prisma:seed
```

### Start Development Server

```bash
npm run start:dev
```

API will be available at http://localhost:3000

### Run Tests

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## API Documentation

### Authentication

#### POST /api/v1/auth/login

Login with email and password

```json
{
  "email": "sales@example.com",
  "password": "sales123"
}
```

Returns JWT token.

### Regions (Admin only for write)

- `GET /api/v1/regions` - List all regions
- `POST /api/v1/regions` - Create region
- `PUT /api/v1/regions/:id` - Update region
- `DELETE /api/v1/regions/:id` - Delete region

### Stores

- `GET /api/v1/stores` - List stores (with filters)
- `POST /api/v1/stores` - Create store (Admin)
- `PUT /api/v1/stores/:id` - Update store (Admin)
- `DELETE /api/v1/stores/:id` - Delete store (Admin)

### Products

- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/:id` - Update product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

### Visits

- `GET /api/v1/visits` - List visits (filtered by user role)
- `POST /api/v1/visits` - Create visit
- `GET /api/v1/visits/:id` - Get visit details
- `PUT /api/v1/visits/:id` - Update visit
- `DELETE /api/v1/visits/:id` - Delete visit

### Orders

- `GET /api/v1/orders` - List orders (filtered by user role)
- `POST /api/v1/orders` - Create order with lines
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id` - Update order
- `DELETE /api/v1/orders/:id` - Delete order

### Statistics

- `GET /api/v1/stats/my/visits?range=today|week|month` - My visit stats
- `GET /api/v1/stats/my/sales?range=today|week|month` - My sales stats
- `GET /api/v1/stats/top/stores?range=month&limit=10` - Top stores
- `GET /api/v1/stats/top/products?range=month&limit=10` - Top products

## Project Structure

```
sales-king/
├── backend/                 # NestJS application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── regions/        # Regions module
│   │   ├── stores/         # Stores module
│   │   ├── products/       # Products module
│   │   ├── customers/      # Customers module
│   │   ├── visits/         # Visits module
│   │   ├── orders/         # Orders module
│   │   ├── stats/          # Statistics module
│   │   └── prisma/         # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── test/               # E2E tests
│   └── Dockerfile          # Backend container
├── nginx/
│   ├── nginx.conf          # Nginx configuration
│   └── certs/              # SSL certificates
├── docker-compose.yml      #
```
