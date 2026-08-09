"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDemoUser = getDemoUser;
exports.getUserStats = getUserStats;
const request_1 = require("./request");
function getDemoUser() {
    return (0, request_1.request)({ url: '/users/demo' });
}
function getUserStats(id) {
    return (0, request_1.request)({ url: `/users/${id}/stats` });
}
