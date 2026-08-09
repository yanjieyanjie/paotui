import { getDemoUser, getUserStats } from '../../services/users';
import type { User } from '../../types';

interface MenuItem {
  title: string;
  icon: string;
}

interface OrderTabItem {
  key: number;
  tab: number;
  name: string;
  icon: string;
  bg: string;
}

interface IdentityOption {
  value: string;
  label: string;
}

interface WalletItem {
  key: number;
  value: string;
  label: string;
}

Page({
  data: {
    user: null as User | null,
    avatarChar: '',
    identityOptions: [
      { value: 'publisher', label: '发布者' },
      { value: 'runner', label: '跑腿员' },
    ] as IdentityOption[],
    identityIndex: 0,
    publisherWallet: [
      { key: 0, value: '0', label: '积分' },
      { key: 1, value: '0', label: '优惠劵' },
      { key: 2, value: '¥0.00', label: '余额' },
    ] as WalletItem[],
    runnerWallet: [
      { key: 0, value: '0', label: '今日佣金' },
      { key: 1, value: '0', label: '今日成单' },
      { key: 2, value: '0', label: '月准时完成' },
      { key: 3, value: '0', label: '累计佣金' },
      { key: 4, value: '0', label: '累计成单' },
      { key: 5, value: '0%', label: '累计准时率' },
    ] as WalletItem[],
    orderTabs: [
      { key: 0, tab: 0, name: '全部', icon: '📋', bg: '#E8F3FF' },
      { key: 1, tab: 1, name: '待支付', icon: '💰', bg: '#FFF1E0' },
      { key: 2, tab: 2, name: '待接单', icon: '📨', bg: '#FFEBEB' },
      { key: 3, tab: 3, name: '进行中', icon: '🚀', bg: '#E6F7EE' },
      { key: 4, tab: 4, name: '已完成', icon: '✅', bg: '#F1EAFF' },
    ] as OrderTabItem[],
    menus: [
      { title: '我的地址', icon: 'location-o' },
      { title: '我的发布', icon: 'orders-o' },
      { title: '关于我们', icon: 'info-o' },
      { title: '设置', icon: 'setting-o' },
    ] as MenuItem[],
  },

  onShow() {
    const tabBar = (this as any).getTabBar && (this as any).getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 4 });
    }

    this.loadData();
  },

  async loadData() {
    try {
      const user = await getDemoUser();
      const stats = await getUserStats(user.id);
      this.setData({
        user,
        avatarChar: user.nickname.charAt(0),
        publisherWallet: [
          { key: 0, value: String(stats.wallet.points), label: '积分' },
          { key: 1, value: String(stats.wallet.coupons), label: '优惠劵' },
          { key: 2, value: `¥${stats.wallet.balance}`, label: '余额' },
        ],
        runnerWallet: [
          { key: 0, value: stats.runner.todayCommission, label: '今日佣金' },
          { key: 1, value: String(stats.runner.todayOrders), label: '今日成单' },
          { key: 2, value: String(stats.runner.monthOnTime), label: '月准时完成' },
          { key: 3, value: stats.runner.totalCommission, label: '累计佣金' },
          { key: 4, value: String(stats.runner.totalOrders), label: '累计成单' },
          { key: 5, value: stats.runner.onTimeRate, label: '累计准时率' },
        ],
      });
    } catch {
      wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
    }
  },

  onIdentityChange(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value) || 0;
    this.setData({ identityIndex: index });
  },

  onOrderTabTap(e: WechatMiniprogram.TouchEvent) {
    const tab = Number(e.currentTarget.dataset.tab) || 0;
    wx.navigateTo({ url: `/pages/my-orders/my-orders?tab=${tab}` });
  },

  onMenuTap(e: WechatMiniprogram.TouchEvent) {
    const { title } = e.currentTarget.dataset as { title: string };
    if (title === '我的地址') {
      wx.navigateTo({ url: '/pages/address/address' });
      return;
    }

    wx.showToast({ title: '敬请期待', icon: 'none' });
  },
});