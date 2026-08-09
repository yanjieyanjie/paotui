export interface OrderDraft {
  title: string;
  description?: string;
  type: string;
  reward: number;
  pickup?: string;
  delivery?: string;
  gender?: 'male' | 'female';
}

export const ORDER_DRAFT_KEY = 'xypt_order_draft';

export function goOrderConfirm(
  draft: OrderDraft,
  mode: 'order' | 'publish' = 'order',
): void {
  wx.setStorageSync(ORDER_DRAFT_KEY, { draft, mode });
  wx.navigateTo({ url: '/pages/order-confirm/order-confirm' });
}