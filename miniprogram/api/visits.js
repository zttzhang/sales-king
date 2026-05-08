/**
 * 拜访相关API
 */
const request = require("../utils/request");

/**
 * 获取拜访列表
 * @param {Object} params - 查询参数
 * @param {string} params.from - 开始日期
 * @param {string} params.to - 结束日期
 * @param {string} params.storeId - 门店ID
 */
function getVisits(params = {}) {
  return request.get("/visits", params);
}

/**
 * 获取拜访详情
 * @param {string} id - 拜访ID
 */
function getVisit(id) {
  return request.get(`/visits/${id}`);
}

/**
 * 创建拜访
 * @param {Object} data - 拜访数据
 */
function createVisit(data) {
  return request.post("/visits", data);
}

/**
 * 更新拜访
 * @param {string} id - 拜访ID
 * @param {Object} data - 拜访数据
 */
function updateVisit(id, data) {
  return request.put(`/visits/${id}`, data);
}

/**
 * 删除拜访
 * @param {string} id - 拜访ID
 */
function deleteVisit(id) {
  return request.del(`/visits/${id}`);
}

module.exports = {
  getVisits,
  getVisit,
  createVisit,
  updateVisit,
  deleteVisit,
};
