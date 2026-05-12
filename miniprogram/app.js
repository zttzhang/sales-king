// app.js
const authService = require("./utils/auth");

// 根据环境自动选择API地址
const getBaseUrl = () => {
  // 生产环境：使用 HTTPS 域名
  if (typeof wx !== 'undefined') {
    // 小程序环境 - 使用 HTTPS
    return "https://pineai.cloud/api/v1";
  }
  // 备选：相对路径（通过 nginx 代理）
  return "/api/v1";
};

App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: getBaseUrl(),
  },

  onLaunch() {
    console.log("App launched");
    this.checkLogin();
  },

  onShow() {
    console.log("App showed");
  },

  onHide() {
    console.log("App hidden");
  },

  // 检查登录状态
  checkLogin() {
    const token = authService.getToken();
    const userInfo = authService.getUserInfo();

    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      console.log("User already logged in:", userInfo);
    } else {
      console.log("User not logged in");
    }
  },

  // 设置用户信息
  setUserInfo(userInfo, token) {
    this.globalData.userInfo = userInfo;
    this.globalData.token = token;
    authService.saveToken(token);
    authService.saveUserInfo(userInfo);
  },

  // 清除用户信息
  clearUserInfo() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    authService.clearAuth();
  },

  // 检查是否为管理员
  isAdmin() {
    return (
      this.globalData.userInfo && this.globalData.userInfo.role === "admin"
    );
  },
});
