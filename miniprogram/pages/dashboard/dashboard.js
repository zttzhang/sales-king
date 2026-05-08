// pages/dashboard/dashboard.js
const statsApi = require("../../api/stats");
const authService = require("../../utils/auth");
const app = getApp();

Page({
  data: {
    selectedRange: "today",
    visitStats: {},
    salesStats: {},
    loading: false,
    isAdmin: false,
  },

  onLoad() {
    // 检查是否为管理员
    this.setData({
      isAdmin: app.isAdmin(),
    });

    // 加载统计数据
    this.loadStats();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadStats();
  },

  onPullDownRefresh() {
    this.loadStats().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 切换时间范围
  onRangeChange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      selectedRange: range,
    });
    this.loadStats();
  },

  // 加载统计数据
  async loadStats() {
    const { selectedRange } = this.data;
    this.setData({ loading: true });

    try {
      // 并行请求拜访统计和销售统计
      const [visitStats, salesStats] = await Promise.all([
        statsApi.getMyVisits(selectedRange),
        statsApi.getMySales(selectedRange),
      ]);

      this.setData({
        visitStats,
        salesStats,
        loading: false,
      });
    } catch (error) {
      console.error("加载统计数据失败:", error);
      this.setData({ loading: false });
      wx.showToast({
        title: "加载失败",
        icon: "none",
      });
    }
  },
});
