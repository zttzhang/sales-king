/**
 * 订单相关API
 */
const request = require("../utils/request");

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {string} params.from - 开始日期
 * @param {string} params.to - 结束日期
 * @param {string} params.storeId - 门店ID
 * @param {string} params.productId - 商品ID
 */
function getOrders(params = {}) {
  return request.get("/orders", params);
}

/**
 * 获取订单详情
 * @param {string} id - 订单ID
 */
function getOrder(id) {
  return request.get(`/orders/${id}`);
}

/**
 * 创建订单
 * @param {Object} data - 订单数据（含订单头和明细行）
 */
function createOrder(data) {
  return request.post("/orders", data);
}

/**
 * 更新订单
 * @param {string} id - 订单ID
 * @param {Object} data - 订单数据
 */
function updateOrder(id, data) {
  return request.put(`/orders/${id}`, data);
}

/**
 * 删除订单
 * @param {string} id - 订单ID
 */
function deleteOrder(id) {
  return request.del(`/orders/${id}`);
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
};
