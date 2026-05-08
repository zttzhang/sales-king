/**
 * 通用工具函数
 */

/**
 * 格式化日期时间
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 */
function formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  const second = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hour)
    .replace("mm", minute)
    .replace("ss", second);
}

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @param {number} decimals - 小数位数，默认2位
 */
function formatAmount(amount, decimals = 2) {
  if (amount === null || amount === undefined) return "0.00";
  return Number(amount).toFixed(decimals);
}

/**
 * 格式化数量
 * @param {number} qty - 数量
 * @param {number} decimals - 小数位数，默认2位
 */
function formatQty(qty, decimals = 2) {
  if (qty === null || qty === undefined) return "0.00";
  return Number(qty).toFixed(decimals);
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
function getTodayDate() {
  return formatDate(new Date(), "YYYY-MM-DD");
}

/**
 * 获取本周开始日期
 */
function getWeekStartDate() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 周一为一周开始
  const weekStart = new Date(now.setDate(diff));
  return formatDate(weekStart, "YYYY-MM-DD");
}

/**
 * 获取本月开始日期
 */
function getMonthStartDate() {
  const now = new Date();
  return formatDate(
    new Date(now.getFullYear(), now.getMonth(), 1),
    "YYYY-MM-DD",
  );
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 */
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} wait - 等待时间（毫秒）
 */
function throttle(func, wait = 300) {
  let previous = 0;
  return function (...args) {
    const now = Date.now();
    if (now - previous > wait) {
      func.apply(this, args);
      previous = now;
    }
  };
}

/**
 * 显示成功提示
 */
function showSuccess(title = "操作成功", duration = 1500) {
  wx.showToast({
    title,
    icon: "success",
    duration,
  });
}

/**
 * 显示错误提示
 */
function showError(title = "操作失败", duration = 2000) {
  wx.showToast({
    title,
    icon: "none",
    duration,
  });
}

/**
 * 显示确认对话框
 */
function showConfirm(content, title = "提示") {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        if (res.confirm) {
          resolve(true);
        } else {
          reject(false);
        }
      },
      fail: reject,
    });
  });
}

/**
 * 校验是否为正数
 */
function isPositiveNumber(value) {
  return !isNaN(value) && Number(value) > 0;
}

/**
 * 校验是否为非负数
 */
function isNonNegativeNumber(value) {
  return !isNaN(value) && Number(value) >= 0;
}

module.exports = {
  formatDate,
  formatAmount,
  formatQty,
  getTodayDate,
  getWeekStartDate,
  getMonthStartDate,
  debounce,
  throttle,
  showSuccess,
  showError,
  showConfirm,
  isPositiveNumber,
  isNonNegativeNumber,
};
