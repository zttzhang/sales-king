// pages/admin/products/products.js
const productsApi = require('../../../api/products');
const util = require('../../../utils/util');

Page({
  data: {
    products: [],
    keyword: '',
    loading: false,
    showModal: false,
    isEdit: false,
    formData: {
      id: '',
      name: '',
      code: '',
      defaultPrice: '',
      unit: '',
      productLine: '',
      spec: ''
    }
  },

  onLoad() {
    this.loadProducts();
  },

  onPullDownRefresh() {
    this.loadProducts().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onSearchInput: util.debounce(function(e) {
    this.setData({ keyword: e.detail.value });
  }, 300),

  onSearch() {
    this.loadProducts();
  },

  async loadProducts() {
    const { keyword } = this.data;
    this.setData({ loading: true });

    try {
      const products = await productsApi.getProducts({ keyword });
      this.setData({
        products,
        loading: false
      });
    } catch (error) {
      console.error('加载商品列表失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onAdd() {
    this.showFormModal();
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === id);
    this.showFormModal(product);
  },

  showFormModal(product = null) {
    const isEdit = !!product;
    this.setData({
      showModal: true,
      isEdit,
      formData: {
        id: product?.id || '',
        name: product?.name || '',
        code: product?.code || '',
        defaultPrice: product?.defaultPrice?.toString() || '',
        unit: product?.unit || '',
        productLine: product?.productLine || '',
        spec: product?.spec || ''
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
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }

    const submitData = {
      name: formData.name,
      code: formData.code || undefined,
      productLine: formData.productLine || undefined,
      unit: formData.unit || undefined,
      spec: formData.spec || undefined,
      defaultPrice: formData.defaultPrice ? parseFloat(formData.defaultPrice) : undefined
    };

    try {
      if (isEdit) {
        await productsApi.updateProduct(formData.id, submitData);
        wx.showToast({ title: '更新成功' });
      } else {
        await productsApi.createProduct(submitData);
        wx.showToast({ title: '创建成功' });
      }
      this.setData({ showModal: false });
      this.loadProducts();
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  async onDelete(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await productsApi.deleteProduct(id);
            wx.showToast({ title: '删除成功' });
            this.loadProducts();
          } catch (error) {
            console.error('删除失败:', error);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});