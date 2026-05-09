// pages/admin/stores/stores.js
const storesApi = require('../../../api/stores');
const regionsApi = require('../../../api/regions');
const util = require('../../../utils/util');

Page({
  data: {
    stores: [],
    keyword: '',
    loading: false,
    regions: [],
    showModal: false,
    isEdit: false,
    formData: {
      id: '',
      name: '',
      address: '',
      regionId: '',
      contactName: '',
      contactPhone: ''
    },
    selectedRegionName: ''
  },

  onLoad() {
    this.loadStores();
    this.loadRegions();
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
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  async loadRegions() {
    try {
      const regions = await regionsApi.getRegions();
      this.setData({ regions });
    } catch (error) {
      console.error('加载区域列表失败:', error);
    }
  },

  onAdd() {
    this.showFormModal();
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    const store = this.data.stores.find(s => s.id === id);
    const region = this.data.regions.find(r => r.id === store.regionId);
    this.setData({ selectedRegionName: region?.name || '' });
    this.showFormModal(store);
  },

  showFormModal(store = null) {
    const isEdit = !!store;
    const { regions } = this.data;
    let selectedRegionName = '';
    
    if (store && store.regionId) {
      const region = regions.find(r => r.id === store.regionId);
      selectedRegionName = region?.name || '';
    }
    
    this.setData({
      showModal: true,
      isEdit,
      selectedRegionName,
      formData: {
        id: store?.id || '',
        name: store?.name || '',
        address: store?.address || '',
        regionId: store?.regionId || '',
        contactName: store?.contactName || '',
        contactPhone: store?.contactPhone || ''
      }
    });
  },

  onModalClose() {
    this.setData({ showModal: false });
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  onRegionChange(e) {
    const index = e.detail.value;
    const region = this.data.regions[index];
    this.setData({
      'formData.regionId': region.id,
      selectedRegionName: region.name
    });
  },

  async onSubmit() {
    const { formData, isEdit } = this.data;
    
    if (!formData.name) {
      wx.showToast({ title: '请输入门店名称', icon: 'none' });
      return;
    }

    try {
      if (isEdit) {
        await storesApi.updateStore(formData.id, formData);
        wx.showToast({ title: '更新成功' });
      } else {
        await storesApi.createStore(formData);
        wx.showToast({ title: '创建成功' });
      }
      this.setData({ showModal: false });
      this.loadStores();
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  async onDelete(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该门店吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await storesApi.deleteStore(id);
            wx.showToast({ title: '删除成功' });
            this.loadStores();
          } catch (error) {
            console.error('删除失败:', error);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
