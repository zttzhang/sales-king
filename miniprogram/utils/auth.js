/**
 * 认证相关工具函数
 */

const TOKEN_KEY = "auth_token";
const USER_INFO_KEY = "user_info";

/**
 * 保存token
 */
function saveToken(token) {
  try {
    wx.setStorageSync(TOKEN_KEY, token);
    return true;
  } catch (e) {
    console.error("保存token失败:", e);
    return false;
  }
}

/**
 * 获取token
 */
function getToken() {
  try {
    return wx.getStorageSync(TOKEN_KEY);
  } catch (e) {
    console.error("获取token失败:", e);
    return null;
  }
}

/**
 * 删除token
 */
function removeToken() {
  try {
    wx.removeStorageSync(TOKEN_KEY);
    return true;
  } catch (e) {
    console.error("删除token失败:", e);
    return false;
  }
}

/**
 * 保存用户信息
 */
function saveUserInfo(userInfo) {
  try {
    wx.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo));
    return true;
  } catch (e) {
    console.error("保存用户信息失败:", e);
    return false;
  }
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  try {
    const userInfoStr = wx.getStorageSync(USER_INFO_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (e) {
    console.error("获取用户信息失败:", e);
    return null;
  }
}

/**
 * 删除用户信息
 */
function removeUserInfo() {
  try {
    wx.removeStorageSync(USER_INFO_KEY);
    return true;
  } catch (e) {
    console.error("删除用户信息失败:", e);
    return false;
  }
}

/**
 * 清除所有认证信息
 */
function clearAuth() {
  removeToken();
  removeUserInfo();
}

/**
 * 检查是否已登录
 */
function isLoggedIn() {
  const token = getToken();
  const userInfo = getUserInfo();
  return !!(token && userInfo);
}

/**
 * 检查是否为管理员
 */
function isAdmin() {
  const userInfo = getUserInfo();
  return userInfo && userInfo.role === "admin";
}

module.exports = {
  saveToken,
  getToken,
  removeToken,
  saveUserInfo,
  getUserInfo,
  removeUserInfo,
  clearAuth,
  isLoggedIn,
  isAdmin,
};
