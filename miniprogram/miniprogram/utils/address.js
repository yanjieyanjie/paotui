"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDRESS_STORAGE_KEY = void 0;
exports.loadAddressesFromStorage = loadAddressesFromStorage;
exports.decorateAddress = decorateAddress;
exports.loadDefaultAddress = loadDefaultAddress;
exports.ADDRESS_STORAGE_KEY = 'xypt_addresses';
function loadAddressesFromStorage() {
    try {
        const raw = wx.getStorageSync(exports.ADDRESS_STORAGE_KEY);
        return Array.isArray(raw) ? raw : [];
    }
    catch {
        return [];
    }
}
function decorateAddress(item) {
    const parts = [];
    if (item.school)
        parts.push(item.school);
    if (item.dormitory)
        parts.push(item.dormitory);
    if (item.room)
        parts.push(item.room);
    if (item.detail)
        parts.push(item.detail);
    return Object.assign({}, item, { addressText: parts.join(' ') });
}
function loadDefaultAddress() {
    const list = loadAddressesFromStorage().map(decorateAddress);
    return list.find((a) => a.isDefault) || list[0] || null;
}
