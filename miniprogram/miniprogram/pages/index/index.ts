import { acceptOrder, getOrders } from '../../services/orders';
import { decorateOrders } from '../../utils/format';
import type { DisplayOrder } from '../../types';

interface ServiceItem {
  key: number;
  name: string;
  icon: string;
  bg: string;
}

interface AdItem {
  title: string;
  sub: string;
  icon: string;
  cls: string;
}

interface HomeOrder extends DisplayOrder {
  deadlineText: string;
  rewardText: string;
  statusColor: string;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#2F9DE8',
  ACCEPTED: '#FF9F43',
  DONE: '#52C41A',
  CANCELLED: '#8A97A5',
};

function formatDeadline(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  date.setHours(date.getHours() + 3);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatReward(reward: string): string {
  const num = Number(reward);
  return Number.isFinite(num) ? String(num) : reward;
}

Page({
  data: {
    statusBarHeight: 20,
    schools: ['重庆工商职业学院', '重庆工商职业学院 · 合川校区'],
    schoolIndex: 0,
    schoolName: '重庆工商职业学院',
    services: [
      { key: 0, name: '快递代寄', icon: '📦', bg: '#E8F3FF' },
      { key: 1, name: '搬水', icon: '🛢️', bg: '#E6F7EE' },
      { key: 2, name: '代替服务', icon: '🔧', bg: '#F1EAFF' },
      { key: 3, name: '清洁服务', icon: '💧', bg: '#E1F4FF' },
      { key: 4, name: '商品代买', icon: '🛒', bg: '#FFEBF2' },
      { key: 5, name: '打印代送', icon: '📄', bg: '#E8F3FF' },
      { key: 6, name: '校园墙', icon: '🏫', bg: '#FFF1E0' },
      { key: 7, name: '万能任务', icon: '✋', bg: '#FFEBEB' },
      { key: 8, name: '洗衣机代排队', icon: '💦', bg: '#E6F7EE' },
      { key: 9, name: '投诉/建议', icon: '📮', bg: '#FFF7DE' },
    ] as ServiceItem[],
    ads: [
      { title: '新用户下单立减3元', sub: '校园跑腿 · 首单福利', icon: '💰', cls: 'ad-1' },
      { title: '学生自营 · 极速送达', sub: '骑手就近接单，平均30分钟', icon: '⚡', cls: 'ad-2' },
      { title: '接单赚赏金', sub: '课余时间，随时随地接单', icon: '🎁', cls: 'ad-3' },
    ] as AdItem[],
    orders: [] as HomeOrder[],
    loading: true,
  },

  onLoad() {
    const getWindowInfo = (wx as any).getWindowInfo;
    const info = getWindowInfo ? getWindowInfo() : wx.getSystemInfoSync();
    this.setData({ statusBarHeight: (info.statusBarHeight || 20) + 6 });
  },

  onShow() {
    const tabBar = (this as any).getTabBar && (this as any).getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 0 });
    }
    this.loadOrders();
  },

  async loadOrders() {
    try {
      const res = await getOrders({ status: 'OPEN', page: 1, pageSize: 10 });
      const orders = decorateOrders(res.items).map((item) => ({
        ...item,
        deadlineText: formatDeadline(item.createdAt),
        rewardText: formatReward(item.reward),
        statusColor: STATUS_COLORS[item.status] ?? '#8A97A5',
      }));
      this.setData({ orders, loading: false });
    } catch {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
    }
  },

  onSchoolChange(e: WechatMiniprogram.CustomEvent) {
    const index = Number(e.detail.value);
    this.setData({
      schoolIndex: index,
      schoolName: this.data.schools[index],
    });
  },

  onCardTap(e: WechatMiniprogram.TouchEvent) {
    const { type } = e.currentTarget.dataset as { type: string };
    if (type === 'express') {
      wx.navigateTo({ url: '/pages/express/express' });
      return;
    }
    if (type === 'food') {
      wx.navigateTo({ url: '/pages/food/food' });
      return;
    }
    this.goHall('');
  },

  onServiceTap(e: WechatMiniprogram.TouchEvent) {
    const { name } = e.currentTarget.dataset as { name: string };
    if (name === '快递代寄') {
      wx.navigateTo({ url: '/pages/send/send' });
      return;
    }
    if (name === '搬水') {
      wx.navigateTo({ url: '/pages/water/water' });
      return;
    }
    if (name === '清洁服务') {
      wx.navigateTo({ url: '/pages/cleaning/cleaning' });
      return;
    }
    if (name === '打印代送') {
      wx.navigateTo({ url: '/pages/print/print' });
      return;
    }
    if (name === '洗衣机代排队') {
      wx.navigateTo({ url: '/pages/laundry/laundry' });
      return;
    }
    if (name === '代替服务') {
      wx.navigateTo({ url: '/pages/substitute/substitute' });
      return;
    }
    if (name === '商品代买') {
      wx.navigateTo({ url: '/pages/buy/buy' });
      return;
    }
    if (name === '万能任务') {
      wx.navigateTo({ url: '/pages/task/task' });
      return;
    }
    if (name === '校园墙') {
      wx.navigateTo({ url: '/pages/wall/wall' });
      return;
    }
    if (name === '投诉/建议') {
      wx.navigateTo({ url: '/pages/feedback/feedback' });
      return;
    }
    wx.showToast({ title: `${name} · 敬请期待`, icon: 'none' });
  },

  async onAccept(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset as { id: number };
    try {
      await acceptOrder(id);
      wx.showToast({ title: '接单成功', icon: 'success' });
      this.loadOrders();
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '接单失败', icon: 'none' });
    }
  },

  goHall(type?: string) {
    if (typeof type === 'string' && type) {
      getApp<IAppOption>().globalData.hallQuery = { type };
    }
    wx.switchTab({ url: '/pages/hall/hall' });
  },
});