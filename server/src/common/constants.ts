export const ORDER_TYPES = ['EXPRESS', 'FOOD', 'SHOPPING', 'OTHER'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_STATUSES = [
  'OPEN',
  'PAYMENT_PENDING',
  'ACCEPTED',
  'COMPLETION_PENDING',
  'DONE',
  'CANCELLED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// v1 不分角色，接口默认使用种子数据中的演示用户
export const DEFAULT_USER_ID = 1;
