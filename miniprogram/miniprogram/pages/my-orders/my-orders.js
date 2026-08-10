"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orders_1 = require("../../services/orders");
const format_1 = require("../../utils/format");
const TABS = ['全部', '待支付', '待接单', '进行中', '已完成'];
const STATUS_FILTERS = [
    null,
    ['PAYMENT_PENDING'],
    ['OPEN'],
    ['ACCEPTED', 'COMPLETION_PENDING'],
    ['DONE'],
];
Page({
    data: {
        tabs: TABS,
        currentTab: 0,
        orders: [],
        allOrders: [],
        loading: true,
    },
    onLoad(options) {
        const tab = Number(options && options.tab);
        if (!Number.isNaN(tab) && tab >= 0 && tab < TABS.length) {
            this.setData({ currentTab: tab });
        }
    },
    onShow() {
        this.loadOrders();
    },
    onTabTap(e) {
        const index = Number(e.currentTarget.dataset.index) || 0;
        this.setData({ currentTab: index });
        this.applyFilter();
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
    async onConfirm(e) {
        const id = Number(e.currentTarget.dataset.id);
        try {
            await (0, orders_1.confirmOrder)(id);
            wx.showToast({ title: '已确认完成', icon: 'success' });
            this.loadOrders();
        }
        catch (err) {
            wx.showToast({ title: err.message || '操作失败', icon: 'none' });
        }
    },
    async loadOrders() {
        try {
            const res = await (0, orders_1.getOrders)({ page: 1, pageSize: 50 });
            this.setData({
                allOrders: (0, format_1.decorateOrders)(res.items),
                loading: false,
            });
            this.applyFilter();
        }
        catch {
            this.setData({ loading: false });
        }
    },
    applyFilter() {
        const filter = STATUS_FILTERS[this.data.currentTab] || null;
        const list = filter
            ? this.data.allOrders.filter((o) => filter.includes(o.status))
            : this.data.allOrders;
        this.setData({ orders: list });
    },
});
