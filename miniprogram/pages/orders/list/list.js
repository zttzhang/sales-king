// pages/orders/list/list.js
const ordersApi = require('../../../api/orders');
const util = require('../../../utils/util');

Page({
  data: {
    orders: [],
    loading: false
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadOrders() {
    this.setData({ loading: true });

    try {
      const orders = await ordersApi.getOrders({
        from: util.getMonthStartDate(),
        to: util.getTodayDate()
      });

      this.setData({
        orders,
        loading: false
      });
    } catch (error) {
      console.error('加载订单列表失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onViewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/orders/detail/detail?id=${id}`
    });
  },

  getStatusText(status) {
    const statusMap = {
      'PENDING': '待处理',
      'CONFIRMED': '已确认',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    };
    return statusMap[status] || status;
  }
});
