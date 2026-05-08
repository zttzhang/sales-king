/**
 * 区域相关API
 */
const request = require("../utils/request");

/**
 * 获取区域列表
 */
function getRegions() {
  return request.get("/regions");
}

/**
 * 获取区域详情
 * @param {string} id - 区域ID
 */
function getRegion(id) {
  return request.get(`/regions/${id}`);
}

/**
 * 创建区域（管理员）
 * @param {Object} data - 区域数据
 */
function createRegion(data) {
  return request.post("/regions", data);
}

/**
 * 更新区域（管理员）
 * @param {string} id - 区域ID
 * @param {Object} data - 区域数据
 */
function updateRegion(id, data) {
  return request.put(`/regions/${id}`, data);
}

/**
 * 删除区域（管理员）
 * @param {string} id - 区域ID
 */
function deleteRegion(id) {
  return request.del(`/regions/${id}`);
}

module.exports = {
  getRegions,
  getRegion,
  createRegion,
  updateRegion,
  deleteRegion,
};
