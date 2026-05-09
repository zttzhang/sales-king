// pages/orders/detail/detail.js
const ordersApi = require('../../../api/orders');

Page({
  data: {
    orderId: '',
    order: {},
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id });
      this.loadOrderDetail(options.id);
    }
  },

  async loadOrderDetail(id) {
    this.setData({ loading: true });

    try {
      const order = await ordersApi.getOrder(id);
      this.setData({
        order,
        loading: false
      });
    } catch (error) {
      console.error('加载订单详情失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
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
