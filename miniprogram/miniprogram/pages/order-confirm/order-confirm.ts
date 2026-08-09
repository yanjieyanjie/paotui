import { createOrder, payOrder } from '../../services/orders';
import { ORDER_TYPE_LABELS } from '../../types/index';
import { ORDER_DRAFT_KEY } from '../../utils/order-flow';
import { DEMO_USER_ID } from '../../utils/config';
import type { OrderDraft } from '../../utils/order-flow';

Page({
  data: {
    draft: null as OrderDraft | null,
    typeLabel: '',
    reward: '0.00',
    orderId: 0,
    showPaySheet: false,
    paying: false,
  },

  onLoad() {
    const stored = wx.getStorageSync(ORDER_DRAFT_KEY) as
      | { draft?: OrderDraft }
      | undefined;
    wx.removeStorageSync(ORDER_DRAFT_KEY);
    if (!stored || !stored.draft) {
      wx.showToast({ title: '订单信息缺失', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    const draft = stored.draft;
    this.setData({
      draft,
      typeLabel: ORDER_TYPE_LABELS[draft.type] || draft.type,
      reward: Number(draft.reward).toFixed(2),
    });
    this.createPendingOrder(draft);
  },

  async createPendingOrder(draft: OrderDraft) {
    try {
      const order = await createOrder({ ...draft, creatorId: DEMO_USER_ID });
      this.setData({ orderId: order.id });
    } catch {
      wx.showToast({ title: '下单失败，请确认后端已启动', icon: 'none' });
    }
  },

  onPayNow() {
    if (!this.data.orderId) {
      wx.showToast({ title: '订单创建中，请稍候', icon: 'none' });
      return;
    }
    this.setData({ showPaySheet: true });
  },

  onCloseSheet() {
    if (this.data.paying) return;
    this.setData({ showPaySheet: false });
  },

  onCancelPay() {
    this.setData({ showPaySheet: false });
    wx.redirectTo({ url: '/pages/pending-pay/pending-pay' });
  },

  noop() {},

  async onConfirmPay() {
    if (this.data.paying) return;
    const orderId = this.data.orderId;
    this.setData({ paying: true });
    try {
      await payOrder(orderId);
      wx.showToast({ title: '支付成功', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/my-orders/my-orders?tab=2' });
      }, 800);
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '支付失败', icon: 'none' });
      this.setData({ paying: false });
    }
  },
});

export {};