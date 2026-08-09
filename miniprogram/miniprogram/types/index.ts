export type OrderStatus = 'OPEN' | 'PAYMENT_PENDING' | 'ACCEPTED' | 'COMPLETION_PENDING' | 'DONE' | 'CANCELLED';

export interface User {
  id: number;
  nickname: string;
  avatar?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  title: string;
  description?: string | null;
  type: string;
  reward: string;
  pickup?: string | null;
  delivery?: string | null;
  gender?: string | null;
  acceptedById?: number | null;
  status: OrderStatus;
  creatorId: number;
  creator?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  userId: number;
  orderId?: number | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserStats {
  total: number;
  open: number;
  accepted: number;
  done: number;
  wallet: {
    points: number;
    coupons: number;
    balance: string;
  };
  runner: {
    todayCommission: string;
    todayOrders: number;
    monthOnTime: number;
    totalCommission: string;
    totalOrders: number;
    onTimeRate: string;
  };
}

export interface DisplayOrder extends Order {
  typeLabel: string;
  statusLabel: string;
  tagColor: string;
  timeText: string;
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  EXPRESS: '取快递',
  FOOD: '带饭',
  SHOPPING: '代买',
  OTHER: '其他',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  OPEN: '待接单',
  PAYMENT_PENDING: '待支付',
  ACCEPTED: '进行中',
  COMPLETION_PENDING: '待确认',
  DONE: '已完成',
  CANCELLED: '已取消',
};

export const ORDER_TYPE_COLORS: Record<string, string> = {
  EXPRESS: '#07c160',
  FOOD: '#ff9f43',
  SHOPPING: '#5b8ff9',
  OTHER: '#8a8a8a',
};