/**
 * 网络请求封装
 */
const app = getApp();

/**
 * 发起HTTP请求
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求路径（相对路径）
 * @param {string} options.method - 请求方法
 * @param {Object} options.data - 请求数据
 * @param {boolean} options.auth - 是否需要认证
 */
function request(options) {
  const { url, method = "GET", data = {}, auth = true } = options;

  return new Promise((resolve, reject) => {
    // 构建完整URL
    const fullUrl = `${app.globalData.baseUrl}${url}`;

    // 构建请求头
    const header = {
      "Content-Type": "application/json",
    };

    // 添加认证token
    if (auth && app.globalData.token) {
      header["Authorization"] = `Bearer ${app.globalData.token}`;
    }

    // 显示加载提示
    wx.showLoading({
      title: "加载中...",
      mask: true,
    });

    // 发起请求
    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        wx.hideLoading();

        // 处理响应
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，清除登录信息并跳转到登录页
          app.clearUserInfo();
          wx.showToast({
            title: "登录已过期",
            icon: "none",
          });
          setTimeout(() => {
            wx.reLaunch({
              url: "/pages/login/login",
            });
          }, 1500);
          reject(new Error("未授权"));
        } else {
          // 其他错误
          const errorMsg = res.data.message || "请求失败";
          wx.showToast({
            title: errorMsg,
            icon: "none",
          });
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error("请求失败:", err);
        wx.showToast({
          title: "网络请求失败",
          icon: "none",
        });
        reject(err);
      },
    });
  });
}

/**
 * GET 请求
 */
function get(url, data = {}, auth = true) {
  return request({
    url,
    method: "GET",
    data,
    auth,
  });
}

/**
 * POST 请求
 */
function post(url, data = {}, auth = true) {
  return request({
    url,
    method: "POST",
    data,
    auth,
  });
}

/**
 * PUT 请求
 */
function put(url, data = {}, auth = true) {
  return request({
    url,
    method: "PUT",
    data,
    auth,
  });
}

/**
 * DELETE 请求
 */
function del(url, data = {}, auth = true) {
  return request({
    url,
    method: "DELETE",
    data,
    auth,
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
};
