"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = getMessages;
exports.readMessage = readMessage;
const request_1 = require("./request");
function getMessages(unreadOnly = false) {
    return (0, request_1.request)({ url: '/messages', data: { unreadOnly } });
}
function readMessage(id) {
    return (0, request_1.request)({ url: `/messages/${id}/read`, method: 'PATCH' });
}
