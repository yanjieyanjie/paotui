"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserId = getCurrentUserId;
exports.setCurrentUserId = setCurrentUserId;
const config_1 = require("./config");
const CURRENT_USER_KEY = 'currentUserId';
function getCurrentUserId() {
    try {
        const id = wx.getStorageSync(CURRENT_USER_KEY);
        return typeof id === 'number' && id > 0 ? id : config_1.DEMO_USER_ID;
    }
    catch {
        return config_1.DEMO_USER_ID;
    }
}
function setCurrentUserId(id) {
    try {
        wx.setStorageSync(CURRENT_USER_KEY, id);
    }
    catch {
        // 忽略存储异常
    }
}
