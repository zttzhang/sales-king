/**
 * 认证相关API
 */
const request = require("../utils/request");

/**
 * 登录（账号密码方式）
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
function login(username, password) {
  return request.post(
    "/auth/login",
    {
      username,
      password,
    },
    false,
  );
}

/**
 * 微信登录
 * @param {string} code - 微信登录code
 */
function wxLogin(code) {
  return request.post(
    "/auth/wx-login",
    {
      code,
    },
    false,
  );
}

/**
 * 获取当前用户信息
 */
function getCurrentUser() {
  return request.get("/auth/me");
}

/**
 * 登出
 */
function logout() {
  return request.post("/auth/logout");
}

module.exports = {
  login,
  wxLogin,
  getCurrentUser,
  logout,
};
