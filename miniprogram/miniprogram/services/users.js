"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDemoUser = getDemoUser;
exports.getUser = getUser;
exports.getUsers = getUsers;
exports.getUserStats = getUserStats;
exports.updateUser = updateUser;
const request_1 = require("./request");
function getDemoUser() {
    return (0, request_1.request)({ url: '/users/demo' });
}
function getUser(id) {
    return (0, request_1.request)({ url: `/users/${id}` });
}
function getUsers() {
    return (0, request_1.request)({ url: '/users' });
}
function getUserStats(id) {
    return (0, request_1.request)({ url: `/users/${id}/stats` });
}
function updateUser(id, payload) {
    return (0, request_1.request)({ url: `/users/${id}`, method: 'PATCH', data: payload });
}
