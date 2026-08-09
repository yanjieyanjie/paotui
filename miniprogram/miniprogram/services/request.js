"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = request;
const config_1 = require("../utils/config");
function request(options) {
    const source = options.data;
    const data = {};
    if (source) {
        Object.keys(source).forEach((key) => {
            const value = source[key];
            if (value !== undefined && value !== null && value !== '') {
                data[key] = value;
            }
        });
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${config_1.BASE_URL}${options.url}`,
            method: (options.method ?? 'GET'),
            data,
            timeout: 10000,
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                    return;
                }
                const body = res.data;
                const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
                reject(new Error(message ?? `请求失败（${res.statusCode}）`));
            },
            fail: (err) => {
                reject(new Error(err.errMsg ?? '网络连接失败'));
            },
        });
    });
}
