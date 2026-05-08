# 微信小程序语法错误修复指南

## 问题说明

所有页面的 JavaScript 文件中，`Page()` 定义缺少 `` 关键字。

## 需要修复的文件列表

以下8个文件需要在 `Page({` 后面添加 `data:` 关键字：

### 1. pages/dashboard/dashboard.js

**第7行**，将：

```javascript
Page({
   {
```

改为：

```javascript
Page({
   {
```

### 2. pages/stores/list/list.js

**第6行**，将：

```javascript
Page({
   {
```

改为：

```javascript
Page({
   {
```

### 3. pages/stores/detail/detail.js

**第5行**，将：

```javascript
Page({
   {
```

改为：

```javascript
Page({
  data: {
```

### 4. pages/visits/list/list.js

**第6行**，将：

```javascript
Page({
   {
```

改为：

```javascript
Page({
   {
```

### 5. pages/visits/create/create.js

**第7行**，将：

```javascript
Page({
   {
```

改为：

```javascript
Page({
   {
```

### 6. pages/orders/list/list.js

**第6行**，将：

```javascript
Page({
   {
```

改为：

```javascript
Page({
   {
```

### 7. pages/orders/create/create.js

**第3行**，将：

```javascript
Page({
   {}
```

改为：

```javascript
Page({
   {}
```

### 8. pages/orders/detail/detail.js

**第3行**，将：

```javascript
Page({
   {}
```

改为：

```javascript
Page({
   {}
```

## 快速修复方法

### 方法1：VS Code 查找替换（推荐）

1. 打开 VS Code
2. 按 `Ctrl+Shift+H` 打开全局查找替换
3. 在"要搜索的文件"中输入：`miniprogram/pages/**/*.js`
4. 启用正则表达式（点击 `.*` 按钮）
5. 查找：`Page\(\{\n   \{`
6. 替换为：`Page({\n  data: {`
7. 点击"全部替换"

### 方法2：手动逐个修复

在每个文件中：

1. 找到 `Page({`
2. 在下一行的开头添加 ` `
3. 确保缩进正确（2个空格）

## 修复后验证

修复完成后，在微信开发者工具中：

1. 点击"编译"
2. 检查是否还有错误提示
3. 如果没有错误，说明修复成功

## 已完成的页面

以下页面已正确配置，无需修复：

- ✅ pages/login/login.js
- ✅ pages/admin/menu/menu.js
- ✅ pages/admin/regions/regions.js
- ✅ pages/admin/stores/stores.js
- ✅ pages/admin/products/products.js
- ✅ pages/admin/customers/customers.js
