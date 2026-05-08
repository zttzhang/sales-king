# 快速启动指南

## 1. 配置 API 地址

编辑 `miniprogram/app.js`，修改第8行的 `baseUrl`：

```javascript
globalData: {
  userInfo: null,
  token: null,
  baseUrl: "http://localhost:3000/api/v1", // 修改为实际后端地址
},
```

### 常见配置：

- **本地开发**：`http://localhost:3000/api/v1`
- **局域网测试**：`http://192.168.x.x:3000/api/v1`（替换为电脑IP）
- **生产环境**：`https://api.yourdomain.com/api/v1`

## 2. 启动后端服务

### 方法A：开发模式

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

### 方法B：Docker Compose

```bash
# 在项目根目录
docker-compose up -d
```

后端服务将在 `http://localhost:3000` 启动

## 3. 配置微信开发者工具

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

2. 打开微信开发者工具，选择"导入项目"

3. 项目配置：
   - 项目目录：选择 `miniprogram` 文件夹
   - AppID：填入你的小程序 AppID（或选择测试号）
   - 项目名称：销售管理系统

4. 点击"导入"

## 4. 修改项目配置

编辑 `miniprogram/project.config.json`：

```json
{
  "appid": "your-appid-here", // 修改为实际 AppID
  "projectname": "sales-king"
}
```

## 5. 临时解决 TabBar 图标问题

由于暂时没有图标文件，有两个临时方案：

### 方案A：注释掉 TabBar（推荐）

编辑 `miniprogram/app.json`，注释掉 tabBar 配置：

```json
{
  "pages": [...],
  "window": {...},
  // "tabBar": {
  //   ...
  // }
}
```

### 方案B：使用占位图标

创建简单的占位图标文件（81x81px 的纯色PNG）放在 `miniprogram/images/` 目录

## 6. 编译和测试

1. 在微信开发者工具中点击"编译"
2. 如果看到登录页面，说明配置成功
3. 使用默认账号登录：
   - 管理员：`admin` / `admin123`
   - 销售：`sales` / `sales123`

## 7. 常见问题

### 问题1：编译错误 - 找不到 data 关键字

所有页面JS文件中的 `Page({` 后面缺少 `` 关键字。

**解决方法**：参考 `SYNTAX_FIX_GUIDE.md` 进行修复

### 问题2：网络请求失败

- 检查后端服务是否启动：访问 `http://localhost:3000/health`
- 检查 `app.js` 中的 `baseUrl` 配置是否正确
- 在微信开发者工具中，勾选"不校验合法域名"

### 问题3：TabBar 图标不显示

- 临时方案：注释掉 `app.json` 中的 `tabBar` 配置
- 长期方案：准备图标文件，参考 `images/README.md`

## 8. 下一步

1. ✅ 修复所有 JS 文件的 `` 关键字问题
2. ✅ 启动后端服务并测试 API
3. ✅ 在小程序中测试登录功能
4. 📝 完善订单创建和详情页面
5. 📝 添加真实的 TabBar 图标
6. 📝 进行完整的功能测试

## 9. 开发模式调试

启用调试模式：

1. 点击微信开发者工具右上角的"详情"
2. 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
3. 勾选"启用调试"

## 10. 真机调试

1. 确保手机和电脑在同一局域网
2. 修改 `baseUrl` 为电脑的局域网IP
3. 点击工具栏的"真机调试"
4. 使用微信扫码

---

**完整文档**：

- 详细部署：`DEPLOYMENT_TENCENT_CLOUD.md`
- 语法修复：`SYNTAX_FIX_GUIDE.md`
- 小程序开发：`README.md`
- 后端文档：`backend/README.md`
