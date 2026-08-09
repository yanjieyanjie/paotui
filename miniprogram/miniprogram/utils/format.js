"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTime = formatTime;
exports.decorateOrder = decorateOrder;
exports.decorateOrders = decorateOrders;
const index_1 = require("../types/index");
function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    if (date.toDateString() === now.toDateString()) {
        return hm;
    }
    return `${date.getMonth() + 1}月${date.getDate()}日 ${hm}`;
}
function decorateOrder(order) {
    return {
        ...order,
        typeLabel: index_1.ORDER_TYPE_LABELS[order.type] ?? order.type,
        statusLabel: index_1.ORDER_STATUS_LABELS[order.status] ?? order.status,
        tagColor: index_1.ORDER_TYPE_COLORS[order.type] ?? '#8a8a8a',
        timeText: formatTime(order.createdAt),
    };
}
function decorateOrders(orders) {
    return orders.map(decorateOrder);
}
