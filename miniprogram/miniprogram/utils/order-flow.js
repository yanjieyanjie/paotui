"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_DRAFT_KEY = void 0;
exports.goOrderConfirm = goOrderConfirm;
exports.ORDER_DRAFT_KEY = 'xypt_order_draft';
function goOrderConfirm(draft, mode = 'order') {
    wx.setStorageSync(exports.ORDER_DRAFT_KEY, { draft, mode });
    wx.navigateTo({ url: '/pages/order-confirm/order-confirm' });
}
