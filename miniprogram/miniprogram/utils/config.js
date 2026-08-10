"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_USER_ID = exports.BASE_URL = void 0;
// 后端服务地址
// - 开发版（模拟器 / 真机调试）：使用电脑局域网 IP，真机与电脑需在同一网络
// - 体验版 / 正式版：必须使用已备案的 HTTPS 域名（上线前替换 BASE_URL_PROD）
const BASE_URL_DEV = 'http://192.168.1.13:3000/api';
const BASE_URL_PROD = 'https://api.your-domain.com/api';
function getEnvVersion() {
    try {
        return wx.getAccountInfoSync().miniProgram.envVersion;
    }
    catch (e) {
        return 'develop';
    }
}
exports.BASE_URL = getEnvVersion() === 'develop' ? BASE_URL_DEV : BASE_URL_PROD;
// v1 不分角色，统一使用种子数据中的演示用户
exports.DEMO_USER_ID = 1;
