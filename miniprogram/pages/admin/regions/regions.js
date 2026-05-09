// pages/admin/regions/regions.js
const regionsApi = require('../../../api/regions');
const util = require('../../../utils/util');

Page({
  data: {
    regions: [],
    keyword: '',
    loading: false,
    showModal: false,
    isEdit: false,
    formData: {
      id: '',
      name: '',
      description: ''
    }
  },

  onLoad() {
    this.loadRegions();
  },

  onPullDownRefresh() {
    this.loadRegions().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onSearchInput: util.debounce(function(e) {
    this.setData({ keyword: e.detail.value });
  }, 300),

  onSearch() {
    this.loadRegions();
  },

  async loadRegions() {
    this.setData({ loading: true });

    try {
      const regions = await regionsApi.getRegions();
      this.setData({
        regions,
        loading: false
      });
    } catch (error) {
      console.error('加载区域列表失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onAdd() {
    this.showFormModal();
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    const region = this.data.regions.find(r => r.id === id);
    this.showFormModal(region);
  },

  showFormModal(region = null) {
    const isEdit = !!region;
    this.setData({
      showModal: true,
      isEdit,
      formData: {
        id: region ? region.id : '',
        name: region ? region.name : '',
        description: region ? region.description : ''
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

  async onSubmit() {
    const { formData, isEdit } = this.data;
    
    if (!formData.name) {
      wx.showToast({ title: '请输入区域名称', icon: 'none' });
      return;
    }

    try {
      if (isEdit) {
        await regionsApi.updateRegion(formData.id, formData);
        wx.showToast({ title: '更新成功' });
      } else {
        await regionsApi.createRegion(formData);
        wx.showToast({ title: '创建成功' });
      }
      this.setData({ showModal: false });
      this.loadRegions();
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  async onDelete(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该区域吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await regionsApi.deleteRegion(id);
            wx.showToast({ title: '删除成功' });
            this.loadRegions();
          } catch (error) {
            console.error('删除失败:', error);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
