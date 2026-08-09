"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../../services/messages");
const format_1 = require("../../utils/format");
Page({
    data: {
        messages: [],
        unreadCount: 0,
        loading: true,
    },
    onShow() {
        const tabBar = this.getTabBar && this.getTabBar();
        if (tabBar) {
            tabBar.setData({ selected: 3 });
        }
        this.loadMessages();
    },
    async loadMessages() {
        try {
            const list = await (0, messages_1.getMessages)();
            const items = list.map((item) => ({ ...item, timeText: (0, format_1.formatTime)(item.createdAt) }));
            const unreadCount = items.filter((item) => !item.isRead).length;
            this.setData({ messages: items, unreadCount, loading: false });
        }
        catch {
            this.setData({ loading: false });
            wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
        }
    },
    onPullDownRefresh() {
        this.loadMessages();
        wx.stopPullDownRefresh();
    },
    async onMessageTap(e) {
        const { id } = e.currentTarget.dataset;
        const target = this.data.messages.find((item) => item.id === id);
        if (!target || target.isRead) {
            return;
        }
        try {
            await (0, messages_1.readMessage)(id);
            const messages = this.data.messages.map((item) => item.id === id ? { ...item, isRead: true } : item);
            this.setData({
                messages,
                unreadCount: messages.filter((item) => !item.isRead).length,
            });
        }
        catch {
            wx.showToast({ title: '操作失败', icon: 'none' });
        }
    },
});
