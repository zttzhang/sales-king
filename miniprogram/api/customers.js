/**
 * 客户相关API
 */
const request = require("../utils/request");

/**
 * 获取客户列表
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 关键字搜索
 */
function getCustomers(params = {}) {
  return request.get("/customers", params);
}

/**
 * 获取客户详情
 * @param {string} id - 客户ID
 */
function getCustomer(id) {
  return request.get(`/customers/${id}`);
}

/**
 * 创建客户（管理员）
 * @param {Object} data - 客户数据
 */
function createCustomer(data) {
  return request.post("/customers", data);
}

/**
 * 更新客户（管理员）
 * @param {string} id - 客户ID
 * @param {Object} data - 客户数据
 */
function updateCustomer(id, data) {
  return request.put(`/customers/${id}`, data);
}

/**
 * 删除客户（管理员）
 * @param {string} id - 客户ID
 */
function deleteCustomer(id) {
  return request.del(`/customers/${id}`);
}

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
