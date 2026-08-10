"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orders_1 = require("../../services/orders");
const index_1 = require("../../types/index");
const order_flow_1 = require("../../utils/order-flow");
const account_1 = require("../../utils/account");
Page({
    data: {
        draft: null,
        typeLabel: '',
        reward: '0.00',
        orderId: 0,
        showPaySheet: false,
        paying: false,
    },
    onLoad() {
        const stored = wx.getStorageSync(order_flow_1.ORDER_DRAFT_KEY);
        wx.removeStorageSync(order_flow_1.ORDER_DRAFT_KEY);
        if (!stored || !stored.draft) {
            wx.showToast({ title: '订单信息缺失', icon: 'none' });
            setTimeout(() => wx.navigateBack(), 800);
            return;
        }
        const draft = stored.draft;
        this.setData({
            draft,
            typeLabel: index_1.ORDER_TYPE_LABELS[draft.type] || draft.type,
            reward: Number(draft.reward).toFixed(2),
        });
        this.createPendingOrder(draft);
    },
    async createPendingOrder(draft) {
        try {
            const order = await (0, orders_1.createOrder)({ ...draft, creatorId: (0, account_1.getCurrentUserId)() });
            this.setData({ orderId: order.id });
        }
        catch {
            wx.showToast({ title: '下单失败，请确认后端已启动', icon: 'none' });
        }
    },
    onPayNow() {
        if (!this.data.orderId) {
            wx.showToast({ title: '订单创建中，请稍候', icon: 'none' });
            return;
        }
        this.setData({ showPaySheet: true });
    },
    onCloseSheet() {
        if (this.data.paying)
            return;
        this.setData({ showPaySheet: false });
    },
    onCancelPay() {
        this.setData({ showPaySheet: false });
        wx.redirectTo({ url: '/pages/pending-pay/pending-pay' });
    },
    noop() { },
    async onConfirmPay() {
        if (this.data.paying)
            return;
        const orderId = this.data.orderId;
        this.setData({ paying: true });
        try {
            await (0, orders_1.payOrder)(orderId);
            wx.showToast({ title: '支付成功', icon: 'success' });
            setTimeout(() => {
                wx.redirectTo({ url: '/pages/my-orders/my-orders?tab=2' });
            }, 800);
        }
        catch (err) {
            wx.showToast({ title: err.message || '支付失败', icon: 'none' });
            this.setData({ paying: false });
        }
    },
});
