// pages/login/login.js
const authApi = require("../../api/auth");
const app = getApp();

Page({
  data: {
    username: "",
    password: "",
    loading: false,
  },

  onLoad() {
    // 检查是否已登录
    if (app.globalData.token) {
      wx.reLaunch({
        url: "/pages/dashboard/dashboard",
      });
    }
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value,
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
    });
  },

  async handleLogin() {
    const { username, password } = this.data;

    // 校验
    if (!username || !password) {
      wx.showToast({
        title: "请输入用户名和密码",
        icon: "none",
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await authApi.login(username, password);

      // 保存用户信息和token
      app.setUserInfo(res.user, res.access_token);

      wx.showToast({
        title: "登录成功",
        icon: "success",
      });

      // 跳转到首页
      setTimeout(() => {
        wx.reLaunch({
          url: "/pages/dashboard/dashboard",
        });
      }, 1500);
    } catch (error) {
      console.error("登录失败:", error);
      this.setData({ loading: false });
    }
  },
});
