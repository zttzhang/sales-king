/**
 * 商品相关API
 */
const request = require("../utils/request");

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 关键字搜索
 * @param {string} params.productLine - 产品线
 */
function getProducts(params = {}) {
  return request.get("/products", params);
}

/**
 * 获取商品详情
 * @param {string} id - 商品ID
 */
function getProduct(id) {
  return request.get(`/products/${id}`);
}

/**
 * 创建商品（管理员）
 * @param {Object} data - 商品数据
 */
function createProduct(data) {
  return request.post("/products", data);
}

/**
 * 更新商品（管理员）
 * @param {string} id - 商品ID
 * @param {Object} data - 商品数据
 */
function updateProduct(id, data) {
  return request.put(`/products/${id}`, data);
}

/**
 * 删除商品（管理员）
 * @param {string} id - 商品ID
 */
function deleteProduct(id) {
  return request.del(`/products/${id}`);
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
