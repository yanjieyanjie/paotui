"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orders_1 = require("../../services/orders");
const format_1 = require("../../utils/format");
Page({
    data: {
        orders: [],
        loading: true,
    },
    onShow() {
        this.loadOrders();
    },
    async onPay(e) {
        const id = Number(e.currentTarget.dataset.id);
        try {
            await (0, orders_1.payOrder)(id);
            wx.showToast({ title: '支付成功', icon: 'success' });
            this.loadOrders();
        }
        catch (err) {
            wx.showToast({ title: err.message || '支付失败', icon: 'none' });
        }
    },
    async onCancel(e) {
        const id = Number(e.currentTarget.dataset.id);
        try {
            await (0, orders_1.cancelOrder)(id);
            wx.showToast({ title: '订单已取消', icon: 'success' });
            this.loadOrders();
        }
        catch (err) {
            wx.showToast({ title: err.message || '取消失败', icon: 'none' });
        }
    },
    async loadOrders() {
        try {
            const res = await (0, orders_1.getOrders)({ status: 'PAYMENT_PENDING', page: 1, pageSize: 50 });
            this.setData({ orders: (0, format_1.decorateOrders)(res.items), loading: false });
        }
        catch {
            this.setData({ loading: false });
        }
    },
});
