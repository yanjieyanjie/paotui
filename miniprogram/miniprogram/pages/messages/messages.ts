import { getMessages, readMessage } from '../../services/messages';
import { formatTime } from '../../utils/format';
import type { Message } from '../../types';

interface DisplayMessage extends Message {
  timeText: string;
}

Page({
  data: {
    messages: [] as DisplayMessage[],
    unreadCount: 0,
    loading: true,
  },

  onShow() {
    const tabBar = (this as any).getTabBar && (this as any).getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 3 });
    }

    this.loadMessages();
  },

  async loadMessages() {
    try {
      const list = await getMessages();
      const items = list.map((item) => ({ ...item, timeText: formatTime(item.createdAt) }));
      const unreadCount = items.filter((item) => !item.isRead).length;
      this.setData({ messages: items, unreadCount, loading: false });
    } catch {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
    }
  },

  onPullDownRefresh() {
    this.loadMessages();
    wx.stopPullDownRefresh();
  },

  async onMessageTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset as { id: number };
    const target = this.data.messages.find((item) => item.id === id);
    if (!target || target.isRead) {
      return;
    }
    try {
      await readMessage(id);
      const messages = this.data.messages.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      );
      this.setData({
        messages,
        unreadCount: messages.filter((item) => !item.isRead).length,
      });
    } catch {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },
});