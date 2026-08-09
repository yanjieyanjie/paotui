import { ORDER_STATUS_LABELS, ORDER_TYPE_COLORS, ORDER_TYPE_LABELS } from '../types/index';
import type { DisplayOrder, Order } from '../types/index';

export function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (date.toDateString() === now.toDateString()) {
    return hm;
  }
  return `${date.getMonth() + 1}月${date.getDate()}日 ${hm}`;
}

export function decorateOrder(order: Order): DisplayOrder {
  return {
    ...order,
    typeLabel: ORDER_TYPE_LABELS[order.type] ?? order.type,
    statusLabel: ORDER_STATUS_LABELS[order.status] ?? order.status,
    tagColor: ORDER_TYPE_COLORS[order.type] ?? '#8a8a8a',
    timeText: formatTime(order.createdAt),
  };
}

export function decorateOrders(orders: Order[]): DisplayOrder[] {
  return orders.map(decorateOrder);
}