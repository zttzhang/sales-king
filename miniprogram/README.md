# 销售管理系统 - 微信小程序前端

这是外勤拜访 & 销售记录系统的微信小程序前端代码。

## 功能特性

### 1. 用户认证

- 账号密码登录
- JWT Token 认证
- 自动登录状态保持

### 2. 仪表盘（Dashboard）

- 今日/本周/本月统计数据
- 拜访次数、下单次数
- 销售额、订单数、销量展示

### 3. 门店管理

- 门店列表浏览
- 门店搜索（关键字、区域筛选）
- 门店详情查看
- 快捷创建拜访/订单入口

### 4. 拜访管理

- 创建拜访记录
- 拜访列表查看
- 拜访结果记录（意向/已下单/未下单/其他）
- 日期范围筛选

### 5. 订单管理

- 创建订单（订单头+明细行）
- 订单列表查看
- 订单详情展示
- 实时金额计算
- 多商品明细编辑

### 6. 管理员功能

- 区域管理（增删改查）
- 门店管理（增删改查）
- 商品管理（增删改查）
- 客户管理（增删改查）

## 项目结构

```
miniprogram/
├── api/                    # API 接口封装
│   ├── auth.js            # 认证相关
│   ├── stores.js          # 门店相关
│   ├── products.js        # 商品相关
│   ├── regions.js         # 区域相关
│   ├── customers.js       # 客户相关
│   ├── visits.js          # 拜访相关
│   ├── orders.js          # 订单相关
│   └── stats.js           # 统计相关
├── pages/                  # 页面
│   ├── login/             # 登录页
│   ├── dashboard/         # 仪表盘
│   ├── stores/            # 门店相关页面
│   ├── visits/            # 拜访相关页面
│   ├── orders/            # 订单相关页面
│   └── admin/             # 管理员页面
├── utils/                  # 工具函数
│   ├── request.js         # HTTP 请求封装
│   ├── auth.js            # 认证工具
│   └── util.js            # 通用工具函数
├── images/                 # 图片资源
├── app.js                  # 小程序入口
├── app.json               # 小程序配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
└── sitemap.json           # 站点地图

```

## 配置说明

### 1. 修改 API 地址

编辑 `app.js` 文件，修改 `baseUrl`:

```javascript
globalData: {
  baseUrl: "https://your-api-domain.com/api/v1"; // 修改为实际API地址
}
```

### 2. 配置小程序 AppID

编辑 `project.config.json` 文件，修改 `appid`:

```json
{
  "appid": "your-wechat-appid-here"
}
```

## 开发指南

### 1. 安装微信开发者工具

从 [微信官方网站](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 下载并安装微信开发者工具。

### 2. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `miniprogram` 目录
4. 填写项目名称和 AppID
5. 点击"导入"

### 3. 本地开发

1. 在微信开发者工具中打开项目
2. 点击"编译"按钮
3. 在模拟器中预览效果
4. 使用调试工具查看日志和网络请求

### 4. 真机调试

1. 点击工具栏的"真机调试"按钮
2. 使用微信扫描二维码
3. 在手机上进行调试

## API 接口说明

所有 API 接口都在 `api/` 目录下封装，使用方式：

```javascript
const storesApi = require("../../api/stores");

// 获取门店列表
const stores = await storesApi.getStores({ keyword: "门店名称" });

// 创建订单
const order = await ordersApi.createOrder({
  storeId: "store-id",
  orderDate: "2026-05-08",
  lines: [
    {
      productId: "product-id",
      qty: 10,
      unitPrice: 100,
    },
  ],
});
```

## 权限说明

### 销售人员（Sales）

- 可创建和查看自己的拜访记录
- 可创建和查看自己的订单
- 可浏览门店、商品信息
- 查看自己的统计数据

### 管理员（Admin）

- 拥有销售人员的所有权限
- 可管理区域、门店、商品、客户主数据
- 可查看所有用户的数据
- 可查看全局统计数据

## 常见问题

### 1. 登录失败

- 检查 API 地址是否正确
- 检查网络连接
- 检查用户名和密码是否正确
- 查看控制台错误信息

### 2. 请求超时

- 检查后端服务是否正常运行
- 检查网络连接
- 检查 API 地址是否可访问

### 3. 数据不显示

- 检查是否已登录
- 检查 Token 是否过期
- 查看控制台错误信息
- 检查数据权限

## 默认测试账号

- 管理员账号: `admin` / `admin123`
- 销售人员账号: `sales` / `sales123`

## 部署上线

### 1. 准备工作

- 完成小程序备案
- 配置服务器域名白名单
- 确保 HTTPS 证书有效
- 完成微信支付配置（如需要）

### 2. 提交审核

1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 登录微信公众平台
4. 提交审核
5. 等待审核通过
6. 发布上线

## 技术栈

- 微信小程序原生框架
- Promise/async-await
- RESTful API

## 许可证

本项目采用 MIT 许可证。
