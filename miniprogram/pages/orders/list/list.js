// pages/orders/list/list.js
const ordersApi = require('../../../api/orders');
const util = require('../../../utils/util');

Page({
   {
    orders: [],
    loading: false
  },

  onLoad() {
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
      this.setData({ loading: false });
    }
  }
});