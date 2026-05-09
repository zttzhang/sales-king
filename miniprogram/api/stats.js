/**
 * 统计相关API
 */
const request = require("../utils/request");

/**
 * 获取我的销售统计
 * @param {string} range - 时间范围：today|week|month
 */
function getMySales(range = "today") {
  return request.get("/stats/my/sales", { range });
}

/**
 * 获取Top门店
 * @param {string} range - 时间范围：today|week|month
 * @param {number} limit - 返回数量
 */
function getTopStores(range = "month", limit = 10) {
  return request.get("/stats/top/stores", { range, limit });
}

/**
 * 获取Top商品
 * @param {string} range - 时间范围：today|week|month
 * @param {number} limit - 返回数量
 */
function getTopProducts(range = "month", limit = 10) {
  return request.get("/stats/top/products", { range, limit });
}

module.exports = {
  getMySales,
  getTopStores,
  getTopProducts,
};