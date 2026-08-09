"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_TYPE_COLORS = exports.ORDER_STATUS_LABELS = exports.ORDER_TYPE_LABELS = void 0;
exports.ORDER_TYPE_LABELS = {
    EXPRESS: '取快递',
    FOOD: '带饭',
    SHOPPING: '代买',
    OTHER: '其他',
};
exports.ORDER_STATUS_LABELS = {
    OPEN: '待接单',
    PAYMENT_PENDING: '待支付',
    ACCEPTED: '进行中',
    COMPLETION_PENDING: '待确认',
    DONE: '已完成',
    CANCELLED: '已取消',
};
exports.ORDER_TYPE_COLORS = {
    EXPRESS: '#07c160',
    FOOD: '#ff9f43',
    SHOPPING: '#5b8ff9',
    OTHER: '#8a8a8a',
};
