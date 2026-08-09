import { cancelOrder, getOrders, payOrder } from '../../services/orders';
import { decorateOrders } from '../../utils/format';
import type { DisplayOrder } from '../../types';

Page({
  data: {
    orders: [] as DisplayOrder[],
    loading: true,
  },

  onShow() {
    this.loadOrders();
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

  async loadOrders() {
    try {
      const res = await getOrders({ status: 'PAYMENT_PENDING', page: 1, pageSize: 50 });
      this.setData({ orders: decorateOrders(res.items), loading: false });
    } catch {
      this.setData({ loading: false });
    }
  },
});

export {};