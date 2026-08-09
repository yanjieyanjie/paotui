import { cancelOrder, confirmOrder, doneOrder, getOrders, payOrder } from '../../services/orders';
import { decorateOrders } from '../../utils/format';
import type { DisplayOrder } from '../../types';

const TABS = ['全部', '待支付', '待接单', '进行中', '已完成'];

const STATUS_FILTERS: Array<string[] | null> = [
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
    orders: [] as DisplayOrder[],
    allOrders: [] as DisplayOrder[],
    loading: true,
  },

  onLoad(options: Record<string, string | undefined>) {
    const tab = Number(options && options.tab);
    if (!Number.isNaN(tab) && tab >= 0 && tab < TABS.length) {
      this.setData({ currentTab: tab });
    }
  },

  onShow() {
    this.loadOrders();
  },

  onTabTap(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset.index) || 0;
    this.setData({ currentTab: index });
    this.applyFilter();
  },

  async onPay(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id);
    try {
      await payOrder(id);
      wx.showToast({ title: '支付成功', icon: 'success' });
      this.loadOrders();
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '支付失败', icon: 'none' });
    }
  },

  async onCancel(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id);
    try {
      await cancelOrder(id);
      wx.showToast({ title: '订单已取消', icon: 'success' });
      this.loadOrders();
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '取消失败', icon: 'none' });
    }
  },

  async onDone(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id);
    try {
      await doneOrder(id);
      wx.showToast({ title: '已标记完成，等待发布者确认', icon: 'success' });
      this.loadOrders();
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '操作失败', icon: 'none' });
    }
  },

  async onConfirm(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id);
    try {
      await confirmOrder(id);
      wx.showToast({ title: '已确认完成', icon: 'success' });
      this.loadOrders();
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '操作失败', icon: 'none' });
    }
  },

  async loadOrders() {
    try {
      const res = await getOrders({ page: 1, pageSize: 50 });
      this.setData({
        allOrders: decorateOrders(res.items),
        loading: false,
      });
      this.applyFilter();
    } catch {
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

export {};