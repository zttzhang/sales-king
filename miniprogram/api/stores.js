/**
 * 门店相关API
 */
const request = require("../utils/request");

/**
 * 获取门店列表
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 关键字搜索
 * @param {string} params.regionId - 区域ID
 */
function getStores(params = {}) {
  return request.get("/stores", params);
}

/**
 * 获取门店详情
 * @param {string} id - 门店ID
 */
function getStore(id) {
  return request.get(`/stores/${id}`);
}

/**
 * 创建门店（管理员）
 * @param {Object} data - 门店数据
 */
function createStore(data) {
  return request.post("/stores", data);
}

/**
 * 更新门店（管理员）
 * @param {string} id - 门店ID
 * @param {Object} data - 门店数据
 */
function updateStore(id, data) {
  return request.put(`/stores/${id}`, data);
}

/**
 * 删除门店（管理员）
 * @param {string} id - 门店ID
 */
function deleteStore(id) {
  return request.del(`/stores/${id}`);
}

module.exports = {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
};
