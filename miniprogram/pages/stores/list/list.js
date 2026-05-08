// pages/stores/list/list.js
const storesApi = require('../../../api/stores');
const util = require('../../../utils/util');

Page({
   {
    stores: [],
    keyword: '',
    loading: false
  },

  onLoad() {
    this.loadStores();
  },

  onPullDownRefresh() {
    this.loadStores().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onSearchInput: util.debounce(function(e) {
    this.setData({ keyword: e.detail.value });
  }, 300),

  onSearch() {
    this.loadStores();
  },

  async loadStores() {
    const { keyword } = this.data;
    this.setData({ loading: true });

    try {
      const stores = await storesApi.getStores({ keyword });
      this.setData({
        stores,
        loading: false
      });
    } catch (error) {
      console.error('加载门店列表失败:', error);
      this.setData({ loading: false });
    }
  }
});