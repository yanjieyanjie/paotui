"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentIdentity = getCurrentIdentity;
exports.setCurrentIdentity = setCurrentIdentity;
exports.ensureRunnerIdentity = ensureRunnerIdentity;
const users_1 = require("../services/users");
const account_1 = require("./account");
const IDENTITY_KEY = 'currentIdentity';
function getCurrentIdentity() {
    try {
        return wx.getStorageSync(IDENTITY_KEY) === 'runner' ? 'runner' : 'publisher';
    }
    catch {
        return 'publisher';
    }
}
function setCurrentIdentity(identity) {
    try {
        wx.setStorageSync(IDENTITY_KEY, identity);
    }
    catch {
        // 忽略存储异常
    }
}
// 抢单前校验身份：返回 true 表示可以继续抢单
function ensureRunnerIdentity() {
    return new Promise((resolve) => {
        if (getCurrentIdentity() === 'runner') {
            resolve(true);
            return;
        }
        (0, users_1.getUser)((0, account_1.getCurrentUserId)())
            .then((user) => {
            if (user.isRunner) {
                wx.showModal({
                    title: '切换身份',
                    content: '你已认证为接单员，请切换为接单员身份后再抢单',
                    confirmText: '切换并抢单',
                    cancelText: '取消',
                    success: (res) => {
                        if (res.confirm) {
                            setCurrentIdentity('runner');
                            resolve(true);
                        }
                        else {
                            resolve(false);
                        }
                    },
                    fail: () => resolve(false),
                });
            }
            else {
                wx.navigateTo({ url: '/pages/runner-apply/runner-apply' });
                resolve(false);
            }
        })
            .catch(() => resolve(true));
    });
}
