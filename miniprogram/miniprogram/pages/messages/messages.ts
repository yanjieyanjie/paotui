import { getConversations, getMessages, readMessage } from '../../services/messages';
import { formatTime } from '../../utils/format';
import type { Conversation, Message } from '../../types';

interface DisplayMessage extends Message {
  timeText: string;
}

interface DisplayConversation extends Conversation {
  timeText: string;
  avatarText: string;
}

const REFRESH_INTERVAL = 10000;
let refreshTimer = 0;

Page({
  data: {
    activeTab: 0,
    conversations: [] as DisplayConversation[],
    notifications: [] as DisplayMessage[],
    chatUnread: 0,
    notifUnread: 0,
    loading: true,
  },

  onShow() {
    const tabBar = (this as any).getTabBar && (this as any).getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 3 });
    }
    this.loadAll();
    if (!refreshTimer) {
      refreshTimer = setInterval(() => this.loadAll(true), REFRESH_INTERVAL) as unknown as number;
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
        getConversations(),
        getMessages(),
      ]);
      const convItems: DisplayConversation[] = conversations.map((item) => ({
        ...item,
        timeText: formatTime(item.lastTime),
        avatarText: item.otherNickname.charAt(0) || '?',
      }));
      const notifItems: DisplayMessage[] = notifications.map((item) => ({
        ...item,
        timeText: formatTime(item.createdAt),
      }));
      this.setData({
        conversations: convItems,
        notifications: notifItems,
        chatUnread: convItems.reduce((sum, item) => sum + item.unreadCount, 0),
        notifUnread: notifItems.filter((item) => !item.isRead).length,
        loading: false,
      });
    } catch {
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

  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const detail = e.detail as { index?: number; name?: number | string };
    const value = detail?.name ?? detail?.index ?? 0;
    this.setData({ activeTab: Number(value) });
  },

  onConversationTap(e: WechatMiniprogram.TouchEvent) {
    const { id, otherid } = e.currentTarget.dataset as { id: number; otherid: number };
    if (!id || !otherid) {
      return;
    }
    wx.navigateTo({ url: `/pages/chat/chat?orderId=${id}&otherUserId=${otherid}` });
  },

  async onMessageTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset as { id: number };
    const target = this.data.notifications.find((item) => item.id === id);
    if (!target || target.isRead) {
      return;
    }
    try {
      await readMessage(id);
      const notifications = this.data.notifications.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      );
      this.setData({
        notifications,
        notifUnread: notifications.filter((item) => !item.isRead).length,
      });
    } catch {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },
});

export {};