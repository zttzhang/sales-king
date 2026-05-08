// pages/visits/create/create.js
const visitsApi = require('../../../api/visits');
const storesApi = require('../../../api/stores');
const util = require('../../../utils/util');

Page({
   {
    stores: [],
    selectedStore: null,
    resultOptions: [
      { value: 'intent', label: '有意向' },
      { value: 'ordered', label: '已下单' },
      { value: 'no_order', label: '未下单' },
      { value: 'other', label: '其他' }
    ],
    selectedResult: null,
    notes: '',
    submitting: false
  },

  onLoad(options) {
    this.loadStores();
    
    // 如果从门店详情页跳转过来，预选门店
    if (options.storeId) {
      this.preselectStore(options.storeId);
    }
  },

  async loadStores() {
    try {
      const stores = await storesApi.getStores();
      this.setData({ stores });
    } catch (error) {
      console.error('加载门店列表失败:', error);
    }
  },

  preselectStore(storeId) {
    const store = this.data.stores.find(s => s.storeId === storeId);
    if (store) {
      this.setData({ selectedStore: store });
    }
  },

  onStoreChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedStore: this.data.stores[index]
    });
  },

  onResultChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedResult: this.data.resultOptions[index]
    });
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  async handleSubmit() {
    const { selectedStore, selectedResult, notes } = this.data;

    if (!selectedStore) {
      return util.showError('请选择门店');
    }
    if (!selectedResult) {
      return util.showError('请选择拜访结果');
    }

    this.setData({ submitting: true });

    try {
      await visitsApi.createVisit({
        storeId: selectedStore.storeId,
        result: selectedResult.value,
        visitTime: new Date().toISOString(),
        notes
      });

      util.showSuccess('创建成功');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('创建拜访失败:', error);
      this.setData({ submitting: false });
    }
  }
});