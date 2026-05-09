// pages/stores/detail/detail.js
const storesApi = require('../../../api/stores');

Page({
  data: {
    storeId: '',
    store: null,
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ storeId: options.id });
      this.loadStoreDetail();
    }
  },

  async loadStoreDetail() {
    const { storeId } = this.data;
    this.setData({ loading: true });

    try {
      const store = await storesApi.getStore(storeId);
      this.setData({
        store,
        loading: false
      });
    } catch (error) {
      console.error('加载门店详情失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  }
});