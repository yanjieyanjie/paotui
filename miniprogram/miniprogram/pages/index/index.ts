import { acceptOrder, cancelOrder, getOrders } from '../../services/orders';
import { decorateOrders } from '../../utils/format';
import { getCurrentUserId } from '../../utils/account';
import { ensureRunnerIdentity } from '../../utils/identity';
import type { DisplayOrder } from '../../types';

const REFRESH_INTERVAL = 30000;
let refreshTimer = 0;

interface ServiceItem {
  key: number;
  name: string;
  icon: string;
  bg: string;
}

interface AdItem {
  type: string;
  title: string;
  sub: string;
  icon: string;
  cls: string;
}

interface HomeOrder extends DisplayOrder {
  showAccept: boolean;
  showWithdraw: boolean;
}

Page({
  data: {
    statusBarHeight: 20,
    schoolName: '',
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
      { type: 'runner', title: '招募接单员', sub: '课余时间 · 接单赚赏金', icon: '🚴', cls: 'ad-1' },
      { type: 'driving', title: '学校附近最便宜驾校', sub: '学生团报 · 低价学车', icon: '🚗', cls: 'ad-2' },
      { type: 'training', title: '最优质培训机构', sub: '名师小班 · 考证无忧', icon: '🎓', cls: 'ad-3' },
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
    this.setData({ schoolName: wx.getStorageSync('selectedSchool') || '重庆工商职业学院' });
    this.loadOrders();
    if (!refreshTimer) {
      refreshTimer = setInterval(() => this.loadOrders(), REFRESH_INTERVAL) as unknown as number;
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

  async loadOrders() {
    try {
      const res = await getOrders({ status: 'OPEN', page: 1, pageSize: 10 });
      const currentUserId = getCurrentUserId();
      const orders = decorateOrders(res.items).map((item) => ({
        ...item,
        showAccept: item.status === 'OPEN' && item.creatorId !== currentUserId,
        showWithdraw: item.status === 'OPEN' && item.creatorId === currentUserId,
      }));
      this.setData({ orders, loading: false });
    } catch {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
    }
  },

  onPullDownRefresh() {
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  onSchoolTap() {
    wx.navigateTo({ url: '/pages/school-select/school-select' });
  },

  onAdTap(e: WechatMiniprogram.TouchEvent) {
    const { type } = e.currentTarget.dataset as { type: string };
    if (type === 'runner') {
      wx.navigateTo({ url: '/pages/runner-apply/runner-apply' });
      return;
    }
    if (type === 'driving' || type === 'training') {
      wx.navigateTo({ url: `/pages/ad/ad?type=${type}` });
    }
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

  onOrderTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset as { id: number };
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
  },

  async onAccept(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset as { id: number };
    const canGrab = await ensureRunnerIdentity();
    if (!canGrab) {
      return;
    }
    const confirmed = await new Promise<boolean>((resolve) => {
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
      await acceptOrder(id, getCurrentUserId());
      wx.showToast({ title: '抢单成功', icon: 'success' });
      this.loadOrders();
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '抢单失败', icon: 'none' });
    }
  },

  async onCancel(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset as { id: number };
    const confirmed = await new Promise<boolean>((resolve) => {
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
      await cancelOrder(id);
      wx.showToast({ title: '已撤回', icon: 'success' });
      this.loadOrders();
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '撤回失败', icon: 'none' });
    }
  },

  goHall(type?: string) {
    if (typeof type === 'string' && type) {
      getApp<IAppOption>().globalData.hallQuery = { type };
    }
    wx.switchTab({ url: '/pages/hall/hall' });
  },
});