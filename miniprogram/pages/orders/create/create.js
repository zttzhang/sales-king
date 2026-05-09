// pages/orders/create/create.js
const ordersApi = require('../../../api/orders');
const storesApi = require('../../../api/stores');
const productsApi = require('../../../api/products');
const util = require('../../../utils/util');

Page({
  data: {
    stores: [],
    products: [],
    selectedStore: null,
    orderLines: [],
    remark: '',
    totalQty: 0,
    totalAmount: 0,
    showProductModal: false,
    productKeyword: ''
  },

  onLoad() {
    this.loadStores();
    this.loadProducts();
  },

  async loadStores() {
    try {
      const stores = await storesApi.getStores();
      this.setData({ stores });
    } catch (error) {
      console.error('加载门店列表失败:', error);
    }
  },

  async loadProducts(keyword = '') {
    try {
      const products = await productsApi.getProducts({ keyword });
      this.setData({ products });
    } catch (error) {
      console.error('加载商品列表失败:', error);
    }
  },

  onStoreChange(e) {
    const index = e.detail.value;
    const store = this.data.stores[index];
    this.setData({ selectedStore: store });
  },

  showProductPicker() {
    this.setData({ showProductModal: true, productKeyword: '' });
    this.loadProducts();
  },

  onProductModalClose() {
    this.setData({ showProductModal: false });
  },

  onProductSearch: util.debounce(function(e) {
    const keyword = e.detail.value;
    this.loadProducts(keyword);
  }, 300),

  onSelectProduct(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === productId);
    
    if (!product) return;

    // 检查是否已添加
    const existingIndex = this.data.orderLines.findIndex(
      line => line.productId === product.id
    );

    if (existingIndex >= 0) {
      // 已存在，增加数量
      const lines = [...this.data.orderLines];
      lines[existingIndex].qty += 1;
      lines[existingIndex].lineAmount = lines[existingIndex].qty * lines[existingIndex].price;
      this.setData({ orderLines: lines });
    } else {
      // 新增
      const newLine = {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        price: Number(product.defaultPrice) || 0,
        qty: 1,
        lineAmount: Number(product.defaultPrice) || 0
      };
      this.setData({
        orderLines: [...this.data.orderLines, newLine]
      });
    }

    this.calculateTotals();
    this.setData({ showProductModal: false });
  },

  onDecrease(e) {
    const index = e.currentTarget.dataset.index;
    const lines = [...this.data.orderLines];
    
    if (lines[index].qty > 1) {
      lines[index].qty -= 1;
      lines[index].lineAmount = lines[index].qty * lines[index].price;
      this.setData({ orderLines: lines });
      this.calculateTotals();
    }
  },

  onIncrease(e) {
    const index = e.currentTarget.dataset.index;
    const lines = [...this.data.orderLines];
    lines[index].qty += 1;
    lines[index].lineAmount = lines[index].qty * lines[index].price;
    this.setData({ orderLines: lines });
    this.calculateTotals();
  },

  onQtyInput(e) {
    const index = e.currentTarget.dataset.index;
    const qty = parseInt(e.detail.value) || 1;
    const lines = [...this.data.orderLines];
    lines[index].qty = qty;
    lines[index].lineAmount = lines[index].qty * lines[index].price;
    this.setData({ orderLines: lines });
    this.calculateTotals();
  },

  onRemoveLine(e) {
    const index = e.currentTarget.dataset.index;
    const lines = [...this.data.orderLines];
    lines.splice(index, 1);
    this.setData({ orderLines: lines });
    this.calculateTotals();
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  calculateTotals() {
    const orderLines = this.data.orderLines;
    const totalQty = orderLines.reduce((sum, line) => sum + line.qty, 0);
    const totalAmount = orderLines.reduce((sum, line) => sum + line.lineAmount, 0);
    this.setData({
      totalQty,
      totalAmount: totalAmount.toFixed(2)
    });
  },

  async onSubmit() {
    const { selectedStore, orderLines, remark, totalQty, totalAmount } = this.data;

    if (!selectedStore) {
      wx.showToast({ title: '请选择门店', icon: 'none' });
      return;
    }

    if (orderLines.length === 0) {
      wx.showToast({ title: '请添加商品', icon: 'none' });
      return;
    }

    try {
      const orderData = {
        storeId: selectedStore.id,
        orderDate: util.formatDate(new Date()),
        lines: orderLines.map(line => ({
          productId: line.productId,
          qty: line.qty,
          price: line.price,
          lineAmount: line.lineAmount
        })),
        totalQty,
        totalAmount,
        notes: remark
      };

      await ordersApi.createOrder(orderData);
      
      wx.showToast({ title: '订单创建成功' });
      
      // 跳转到订单列表
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('创建订单失败:', error);
      wx.showToast({ title: '创建失败', icon: 'none' });
    }
  }
});
