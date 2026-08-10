"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../../services/messages");
const format_1 = require("../../utils/format");
const REFRESH_INTERVAL = 10000;
let refreshTimer = 0;
Page({
    data: {
        activeTab: 0,
        conversations: [],
        notifications: [],
        chatUnread: 0,
        notifUnread: 0,
        loading: true,
    },
    onShow() {
        const tabBar = this.getTabBar && this.getTabBar();
        if (tabBar) {
            tabBar.setData({ selected: 3 });
        }
        this.loadAll();
        if (!refreshTimer) {
            refreshTimer = setInterval(() => this.loadAll(true), REFRESH_INTERVAL);
        }
    },
    onHide() {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = 0;
        }
    },
    onUnload() {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = 0;
        }
    },
    async loadAll(silent = false) {
        if (!silent) {
            this.setData({ loading: true });
        }
        try {
            const [conversations, notifications] = await Promise.all([
                (0, messages_1.getConversations)(),
                (0, messages_1.getMessages)(),
            ]);
            const convItems = conversations.map((item) => ({
                ...item,
                timeText: (0, format_1.formatTime)(item.lastTime),
                avatarText: item.otherNickname.charAt(0) || '?',
            }));
            const notifItems = notifications.map((item) => ({
                ...item,
                timeText: (0, format_1.formatTime)(item.createdAt),
            }));
            this.setData({
                conversations: convItems,
                notifications: notifItems,
                chatUnread: convItems.reduce((sum, item) => sum + item.unreadCount, 0),
                notifUnread: notifItems.filter((item) => !item.isRead).length,
                loading: false,
            });
        }
        catch {
            this.setData({ loading: false });
            if (!silent) {
                wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
            }
        }
    },
    onPullDownRefresh() {
        this.loadAll();
        wx.stopPullDownRefresh();
    },
    onTabChange(e) {
        const detail = e.detail;
        const value = detail?.name ?? detail?.index ?? 0;
        this.setData({ activeTab: Number(value) });
    },
    onConversationTap(e) {
        const { id, otherid } = e.currentTarget.dataset;
        if (!id || !otherid) {
            return;
        }
        wx.navigateTo({ url: `/pages/chat/chat?orderId=${id}&otherUserId=${otherid}` });
    },
    async onMessageTap(e) {
        const { id } = e.currentTarget.dataset;
        const target = this.data.notifications.find((item) => item.id === id);
        if (!target || target.isRead) {
            return;
        }
        try {
            await (0, messages_1.readMessage)(id);
            const notifications = this.data.notifications.map((item) => item.id === id ? { ...item, isRead: true } : item);
            this.setData({
                notifications,
                notifUnread: notifications.filter((item) => !item.isRead).length,
            });
        }
        catch {
            wx.showToast({ title: '操作失败', icon: 'none' });
        }
    },
});
