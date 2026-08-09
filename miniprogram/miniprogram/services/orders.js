"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = getOrders;
exports.acceptOrder = acceptOrder;
exports.doneOrder = doneOrder;
exports.createOrder = createOrder;
exports.payOrder = payOrder;
exports.cancelOrder = cancelOrder;
exports.confirmOrder = confirmOrder;
const request_1 = require("./request");
function getOrders(query = {}) {
    return (0, request_1.request)({ url: '/orders', data: query });
}
function acceptOrder(id) {
    return (0, request_1.request)({ url: `/orders/${id}/accept`, method: 'PATCH' });
}
function doneOrder(id) {
    return (0, request_1.request)({ url: `/orders/${id}/done`, method: 'PATCH' });
}
function createOrder(payload) {
    return (0, request_1.request)({ url: '/orders', method: 'POST', data: payload });
}
function payOrder(id) {
    return (0, request_1.request)({ url: `/orders/${id}/pay`, method: 'POST' });
}
function cancelOrder(id) {
    return (0, request_1.request)({ url: `/orders/${id}/cancel`, method: 'PATCH' });
}
function confirmOrder(id) {
    return (0, request_1.request)({ url: `/orders/${id}/confirm`, method: 'PATCH' });
}
