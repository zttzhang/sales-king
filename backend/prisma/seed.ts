import { PrismaClient, UserRole, VisitResult } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      name: 'System Administrator',
      password: adminPassword,
    },
  });
  console.log('Created admin user:', admin.name);

  // Create default sales user
  const salesPassword = await bcrypt.hash('sales123', 10);
  const sales = await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {},
    create: {
      email: 'sales@example.com',
      role: UserRole.SALES,
      name: 'Sales Representative',
      password: salesPassword,
    },
  });
  console.log('Created sales user:', sales.name);

  // Create sample regions
  const regions = await Promise.all([
    prisma.region.upsert({
      where: { name: '华东区' },
      update: {},
      create: { name: '华东区' },
    }),
    prisma.region.upsert({
      where: { name: '华南区' },
      update: {},
      create: { name: '华南区' },
    }),
    prisma.region.upsert({
      where: { name: '华北区' },
      update: {},
      create: { name: '华北区' },
    }),
  ]);
  console.log('Created regions:', regions.map((r) => r.name).join(', '));

  // Create sample stores
  const store1 = await prisma.store.create({
    data: {
      name: '上海旗舰店',
      regionId: regions[0].id,
      address: '上海市浦东新区世纪大道100号',
      notes: '大型旗舰店，客流量大',
    },
  });
  const store2 = await prisma.store.create({
    data: {
      name: '杭州西湖店',
      regionId: regions[0].id,
      address: '浙江省杭州市西湖区文三路50号',
      notes: '中型门店',
    },
  });
  const store3 = await prisma.store.create({
    data: {
      name: '广州天河店',
      regionId: regions[1].id,
      address: '广东省广州市天河区天河路208号',
      notes: '繁华商圈店',
    },
  });
  const store4 = await prisma.store.create({
    data: {
      name: '北京朝阳店',
      regionId: regions[2].id,
      address: '北京市朝阳区建国路88号',
      notes: '标准店型',
    },
  });
  const stores = [store1, store2, store3, store4];
  console.log('Created stores:', stores.map((s) => s.name).join(', '));

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      name: '经典款T恤',
      productLine: '服装',
      defaultPrice: 99.0,
    },
  });
  const product2 = await prisma.product.create({
    data: {
      name: '运动鞋',
      productLine: '鞋类',
      defaultPrice: 299.0,
    },
  });
  const product3 = await prisma.product.create({
    data: {
      name: '休闲裤',
      productLine: '服装',
      defaultPrice: 199.0,
    },
  });
  const product4 = await prisma.product.create({
    data: {
      name: '双肩包',
      productLine: '配件',
      defaultPrice: 159.0,
    },
  });
  const product5 = await prisma.product.create({
    data: {
      name: '棒球帽',
      productLine: '配件',
      defaultPrice: 59.0,
    },
  });
  const products = [product1, product2, product3, product4, product5];
  console.log('Created products:', products.map((p) => p.name).join(', '));

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      name: '张三',
      type: 'VIP',
    },
  });
  const customer2 = await prisma.customer.create({
    data: {
      name: '李四',
      type: '普通',
    },
  });
  const customer3 = await prisma.customer.create({
    data: {
      name: '王五',
      type: '会员',
    },
  });
  const customers = [customer1, customer2, customer3];
  console.log('Created customers:', customers.map((c) => c.name).join(', '));

  // Create sample visits
  await prisma.visit.create({
    data: {
      storeId: stores[0].id,
      visitTime: new Date('2026-05-08T09:00:00Z'),
      visitorUserId: sales.id,
      result: VisitResult.ORDERED,
      notes: '客户对新品很感兴趣，当场下单',
    },
  });
  await prisma.visit.create({
    data: {
      storeId: stores[1].id,
      visitTime: new Date('2026-05-08T10:30:00Z'),
      visitorUserId: sales.id,
      result: VisitResult.INTENT,
      notes: '店长表示下周可能下单',
    },
  });
  console.log('Created sample visits');

  // Create sample orders
  await prisma.salesOrder.create({
    data: {
      storeId: stores[0].id,
      customerId: customers[0].id,
      orderDate: new Date('2026-05-08'),
      createdByUserId: sales.id,
      notes: '春季促销订单',
      totalAmount: 2435.0,
      totalQty: 15,
      lines: {
        create: [
          {
            productId: products[0].id,
            qty: 10,
            unitPrice: 99.0,
            discountAmount: 0,
            lineAmount: 990.0,
          },
          {
            productId: products[1].id,
            qty: 5,
            unitPrice: 299.0,
            discountAmount: 50.0,
            lineAmount: 1445.0,
          },
        ],
      },
    },
  });

  console.log('Created sample order with lines');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n=== Default Credentials ===');
  console.log('Admin: email=admin@example.com, password=admin123');
  console.log('Sales: email=sales@example.com, password=sales123');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });