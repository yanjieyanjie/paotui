"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orders_1 = require("../../services/orders");
const account_1 = require("../../utils/account");
const format_1 = require("../../utils/format");
const identity_1 = require("../../utils/identity");
const PAGE_SIZE = 10;
Page({
    data: {
        tabs: ['新任务', '进行中', '已完成'],
        tabIndex: 0,
        orders: [],
        page: 1,
        total: 0,
        loading: false,
        finished: false,
    },
    onShow() {
        const tabBar = this.getTabBar && this.getTabBar();
        if (tabBar) {
            tabBar.setData({ selected: 1 });
        }
        this.resetAndLoad();
    },
    resetAndLoad() {
        this.setData({ page: 1, orders: [], total: 0, finished: false });
        this.loadOrders();
    },
    async loadOrders() {
        const { page, finished, loading, tabIndex } = this.data;
        if (finished || loading) {
            return;
        }
        this.setData({ loading: true });
        try {
            const statuses = tabIndex === 0 ? 'OPEN' : tabIndex === 1 ? 'ACCEPTED,COMPLETION_PENDING' : 'DONE';
            const currentUserId = (0, account_1.getCurrentUserId)();
            const res = await (0, orders_1.getOrders)({
                statuses,
                ...(tabIndex > 0 ? { involvedUserId: currentUserId } : {}),
                page,
                pageSize: PAGE_SIZE,
            });
            const items = (0, format_1.decorateOrders)(res.items).map((o) => ({
                ...o,
                showAccept: o.status === 'OPEN' && o.creatorId !== currentUserId,
                showWithdraw: o.status === 'OPEN' && o.creatorId === currentUserId,
            }));
            const merged = page === 1 ? items : this.data.orders.concat(items);
            const exhausted = items.length === 0;
            this.setData({
                orders: merged,
                total: res.total,
                page: page + 1,
                finished: exhausted || merged.length >= res.total,
            });
        }
        catch {
            wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
        }
        finally {
            this.setData({ loading: false });
        }
    },
    onTabChange(e) {
        const index = Number(e.currentTarget.dataset.index) || 0;
        if (index === this.data.tabIndex) {
            return;
        }
        this.setData({ tabIndex: index });
        this.resetAndLoad();
    },
    onCardTap(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
    },
    onReachBottom() {
        this.loadOrders();
    },
    onPullDownRefresh() {
        this.resetAndLoad();
        wx.stopPullDownRefresh();
    },
    async onCancel(e) {
        const { id } = e.currentTarget.dataset;
        const confirmed = await new Promise((resolve) => {
            wx.showModal({
                title: '撤回任务',
                content: '确定撤回这个任务吗？撤回后任务将下架',
                success: (res) => resolve(res.confirm),
                fail: () => resolve(false),
            });
        });
        if (!confirmed) {
            return;
        }
        try {
            await (0, orders_1.cancelOrder)(id);
            wx.showToast({ title: '已撤回', icon: 'success' });
            this.resetAndLoad();
        }
        catch (err) {
            wx.showToast({ title: err.message || '撤回失败', icon: 'none' });
        }
    },
    async onAccept(e) {
        const { id } = e.currentTarget.dataset;
        const canGrab = await (0, identity_1.ensureRunnerIdentity)();
        if (!canGrab) {
            return;
        }
        const confirmed = await new Promise((resolve) => {
            wx.showModal({
                title: '确认抢单',
                content: '确定抢下这个订单吗？',
                success: (res) => resolve(res.confirm),
                fail: () => resolve(false),
            });
        });
        if (!confirmed) {
            return;
        }
        try {
            await (0, orders_1.acceptOrder)(id, (0, account_1.getCurrentUserId)());
            wx.showToast({ title: '抢单成功', icon: 'success' });
            this.resetAndLoad();
        }
        catch (err) {
            wx.showToast({ title: err.message || '抢单失败', icon: 'none' });
        }
    },
    async onDone(e) {
        const { id } = e.currentTarget.dataset;
        const confirmed = await new Promise((resolve) => {
            wx.showModal({
                title: '确认完成',
                content: '确定将该订单标记为完成吗？',
                success: (res) => resolve(res.confirm),
                fail: () => resolve(false),
            });
        });
        if (!confirmed) {
            return;
        }
        try {
            await (0, orders_1.doneOrder)(id);
            wx.showToast({ title: '已提交确认', icon: 'success' });
            this.resetAndLoad();
        }
        catch (err) {
            wx.showToast({ title: err.message || '操作失败', icon: 'none' });
        }
    },
});
