// pages/orders/list/list.js
const ordersApi = require('../../../api/orders');
const util = require('../../../utils/util');

Page({
  data: {
    orders: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.loadOrders(true);
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadOrders(true);
  },

  onPullDownRefresh() {
    this.loadOrders(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadOrders(false);
  },

  async loadOrders(refresh = false) {
    const { page, pageSize } = this.data;
    this.setData({ loading: true });

    try {
      const pageNum = refresh ? 1 : page;
      const orders = await ordersApi.getOrders({
        from: util.getMonthStartDate(),
        to: util.getTodayDate(),
        page: pageNum,
        pageSize: pageSize
      });

      const ordersData = Array.isArray(orders) ? orders : (orders.data || []);
      const newOrders = refresh ? ordersData : [...this.data.orders, ...ordersData];

      this.setData({
        orders: newOrders,
        loading: false,
        page: pageNum,
        hasMore: ordersData.length >= pageSize
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
