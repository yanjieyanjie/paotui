"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = getMessages;
exports.readMessage = readMessage;
exports.getConversations = getConversations;
exports.getChatMessages = getChatMessages;
exports.sendChatMessage = sendChatMessage;
exports.readConversation = readConversation;
const request_1 = require("./request");
const account_1 = require("../utils/account");
function getMessages(unreadOnly = false) {
    return (0, request_1.request)({ url: '/messages', data: { unreadOnly, userId: (0, account_1.getCurrentUserId)() } });
}
function readMessage(id) {
    return (0, request_1.request)({ url: `/messages/${id}/read`, method: 'PATCH' });
}
function getConversations() {
    return (0, request_1.request)({
        url: '/messages/conversations',
        data: { userId: (0, account_1.getCurrentUserId)() },
    });
}
function getChatMessages(orderId, otherUserId) {
    return (0, request_1.request)({
        url: '/messages/conversation',
        data: { userId: (0, account_1.getCurrentUserId)(), orderId, otherUserId },
    });
}
function sendChatMessage(orderId, otherUserId, content, type = 'text') {
    return (0, request_1.request)({
        url: '/messages',
        method: 'POST',
        data: { userId: otherUserId, fromUserId: (0, account_1.getCurrentUserId)(), orderId, content, type },
    });
}
function readConversation(orderId, otherUserId) {
    return (0, request_1.request)({
        url: '/messages/read',
        method: 'PATCH',
        data: { userId: (0, account_1.getCurrentUserId)(), orderId, otherUserId },
    });
}
