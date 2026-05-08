// app.js
const authService = require("./utils/auth");

App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: "https://api.example.com/api/v1", // 修改为实际API地址
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
