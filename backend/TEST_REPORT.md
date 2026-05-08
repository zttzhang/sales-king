# OrdersService 单元测试报告

## 测试执行概览

- **测试文件**: `src/orders/orders.service.spec.ts`
- **执行时间**: 2026-05-08 14:27
- **总测试数**: 15个
- **通过**: 6个 ✅
- **失败**: 9个 ❌
- **执行耗时**: ~1.2秒

---

## ✅ 通过的测试 (6个)

### 1. findOne - 返回订单给所有者(SALES角色)

```typescript
it('should return order for owner (SALES)');
```

✅ **通过** - SALES用户可以查看自己创建的订单

### 2. findOne - 允许ADMIN访问任何订单

```typescript
it('should allow ADMIN to access any order');
```

✅ **通过** - ADMIN用户可以查看任何用户的订单

### 3. findOne - 订单不存在时抛出NotFoundException

```typescript
it('should throw NotFoundException if order does not exist');
```

✅ **通过** - 查询不存在的订单时正确抛出异常

### 4. update - 更新订单并重新计算总额

```typescript
it('should update order and recalculate totals');
```

✅ **通过** - 更新订单功能正常工作

### 5. remove - 删除所有者的订单

```typescript
it('should delete order for owner');
```

✅ **通过** - 用户可以删除自己的订单

### 6. remove - 允许ADMIN删除任何订单

```typescript
it('should allow ADMIN to delete any order');
```

✅ **通过** - ADMIN可以删除任何订单

---

## ❌ 失败的测试 (9个)

### 测试组 1: create - 创建订单验证

#### ❌ 1. 创建订单时正确计算总额

```typescript
it('should create an order with correct total calculations');
```

**失败原因**:

- 期望：`totalAmount: 950, totalQty: 10`
- 实际：`totalAmount: NaN, totalQty: NaN`
- 问题：订单创建时没有正确计算总金额和总数量

**需要修复**:

```typescript
// 在 OrdersService.create() 中添加计算逻辑
const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);
const totalAmount = lines.reduce((sum, line) => sum + line.lineAmount, 0);
```

---

#### ❌ 2. 验证数量为正数

```typescript
it('should validate quantity is positive');
```

**失败原因**:

- 期望：抛出异常
- 实际：测试数据 `qty: -5` 被接受，没有抛出异常

**需要修复**:

```typescript
// 在 OrdersService.create() 中添加验证
if (line.qty <= 0) {
  throw new BadRequestException('数量必须大于0');
}
```

---

#### ❌ 3. 验证折扣不超过行总额

```typescript
it('should validate discount does not exceed line total');
```

**失败原因**:

- 期望：抛出异常
- 实际：测试数据 `discountAmount: 600` (超过 `qty * unitPrice = 500`) 被接受

**需要修复**:

```typescript
// 在 OrdersService.create() 中添加验证
const lineTotal = line.qty * line.unitPrice;
if (line.discountAmount > lineTotal) {
  throw new BadRequestException('折扣金额不能超过行总额');
}
```

---

### 测试组 2: findAll - 查询订单列表

#### ❌ 4. SALES角色只返回用户自己的订单

```typescript
it('should return only user orders for SALES role');
```

**失败原因**:

- 期望：`where: { createdByUserId: "user-123" }`
- 实际：`where: {}`（空对象，没有过滤）

**需要修复**:

```typescript
// 在 OrdersService.findAll() 中添加权限过滤
const where: any = {};
if (user.role === UserRole.SALES) {
  where.createdByUserId = user.id;
}
```

---

#### ❌ 5. ADMIN角色返回所有订单

```typescript
it('should return all orders for ADMIN role');
```

**失败原因**:

- 期望：`where: {}`（返回所有）
- 实际：`where: {}`（正确，但 include 结构不匹配）

**需要修复**:

```typescript
// 调整 include 结构以匹配测试期望
include: {
  lines: true,  // 简化为 true，而不是嵌套 include
  store: true,
  customer: true
}
```

---

#### ❌ 6. 按日期范围过滤

```typescript
it('should filter by date range');
```

**失败原因**:

- 期望：`where: { orderDate: { gte: from, lte: to } }`
- 实际：`where: {}`（没有日期过滤）

**需要修复**:

```typescript
// 在 OrdersService.findAll() 中添加日期过滤
if (from || to) {
  where.orderDate = {};
  if (from) where.orderDate.gte = from;
  if (to) where.orderDate.lte = to;
}
```

---

### 测试组 3: 权限控制

#### ❌ 7. SALES用户尝试访问其他用户订单时抛出ForbiddenException

```typescript
it(
  'should throw ForbiddenException if SALES user tries to access other user order',
);
```

**失败原因**:

- 期望：抛出 `ForbiddenException`
- 实际：返回了订单数据（没有权限检查）

**需要修复**:

```typescript
// 在 OrdersService.findOne() 中添加权限检查
if (user.role === UserRole.SALES && order.createdByUserId !== user.id) {
  throw new ForbiddenException('无权访问此订单');
}
```

---

#### ❌ 8. 不允许SALES用户更新其他用户订单

```typescript
it('should not allow SALES user to update other user order');
```

**失败原因**:

- 期望：抛出 `ForbiddenException`
- 实际：允许更新（没有权限检查）

**需要修复**:

```typescript
// 在 OrdersService.update() 中添加权限检查
const order = await this.findOne(id, user); // 会自动检查权限
```

---

#### ❌ 9. 不允许SALES用户删除其他用户订单

```typescript
it('should not allow SALES user to delete other user order');
```

**失败原因**:

- 期望：抛出 `ForbiddenException`
- 实际：允许删除（没有权限检查）

**需要修复**:

```typescript
// 在 OrdersService.remove() 中添加权限检查
const order = await this.findOne(id, user); // 会自动检查权限
```

---

## 📋 修复优先级

### 🔴 高优先级（安全相关）

1. **权限控制** - 测试 7, 8, 9
   - 防止用户访问/修改其他用户的数据
   - 安全风险高

### 🟡 中优先级（业务逻辑）

2. **数据验证** - 测试 2, 3
   - 防止无效数据进入系统
   - 影响数据完整性

3. **计算逻辑** - 测试 1
   - 确保金额计算正确
   - 影响业务准确性

### 🟢 低优先级（查询优化）

4. **查询过滤** - 测试 4, 5, 6
   - 优化查询性能
   - 改善用户体验

---

## 🎯 下一步行动

### 1. 修改 `backend/src/orders/orders.service.ts`

在 `create()` 方法中添加：

```typescript
// 验证数量和折扣
for (const line of createOrderDto.lines) {
  if (line.qty <= 0) {
    throw new BadRequestException('数量必须大于0');
  }
  const lineTotal = line.qty * line.unitPrice;
  if (line.discountAmount > lineTotal) {
    throw new BadRequestException('折扣金额不能超过行总额');
  }
  line.lineAmount = lineTotal - line.discountAmount;
}

// 计算总额
const totalQty = createOrderDto.lines.reduce((sum, line) => sum + line.qty, 0);
const totalAmount = createOrderDto.lines.reduce(
  (sum, line) => sum + line.lineAmount,
  0,
);
```

在 `findAll()` 方法中添加：

```typescript
// 权限过滤
const where: any = {};
if (user.role === UserRole.SALES) {
  where.createdByUserId = user.id;
}

// 日期过滤
if (filters.from || filters.to) {
  where.orderDate = {};
  if (filters.from) where.orderDate.gte = filters.from;
  if (filters.to) where.orderDate.lte = filters.to;
}
```

在 `findOne()`, `update()`, `remove()` 方法中添加：

```typescript
// 权限检查
if (user.role === UserRole.SALES && order.createdByUserId !== user.id) {
  throw new ForbiddenException('无权访问此订单');
}
```

### 2. 重新运行测试

```bash
cd backend
npm test -- orders.service.spec.ts
```

### 3. 查看测试覆盖率

```bash
npm run test:cov
```

---

## 📊 查看测试报告的方式

### 1. 命令行输出

测试运行后直接在终端查看：

```bash
cd backend
npm test -- orders.service.spec.ts
```

### 2. 生成 HTML 覆盖率报告

```bash
npm run test:cov
```

报告位置：`backend/coverage/lcov-report/index.html`

### 3. VS Code 测试资源管理器

- 点击 VS Code 左侧的"测试"图标
- 可以看到所有测试的树状结构
- 点击单个测试可以运行/调试

### 4. Jest 输出文件

可以配置 Jest 生成 JSON 报告：

```json
// package.json
"test:report": "jest --json --outputFile=test-report.json"
```

---

## 总结

当前 OrdersService 的实现缺少：

1. ✅ **基础 CRUD** - 已实现
2. ❌ **数据验证** - 需要添加
3. ❌ **权限控制** - 需要添加
4. ❌ **查询过滤** - 需要添加
5. ❌ **业务计算** - 需要添加

建议按照上述优先级逐步完善功能，确保所有测试通过。
