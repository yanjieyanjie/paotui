"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_flow_1 = require("../../utils/order-flow");
const address_1 = require("../../utils/address");
const PICKUP_POINTS = ['示例大学菜鸟驿站', '示例大学东门丰巢', '示例大学西门丰巢', '自定义'];
const CUSTOM_INDEX = 3;
const SIZE_OPTIONS = [
    { key: 'small', name: '小件', desc: '文件、小包裹、信封', price: 3 },
    { key: 'medium', name: '中件', desc: '鞋盒、书本、小纸箱', price: 5 },
    { key: 'large', name: '大件', desc: '行李箱、大包裹、桶装物', price: 8 },
];
Page({
    data: {
        pickupPoints: PICKUP_POINTS,
        pickupIndex: 0,
        isCustomPickup: false,
        pickupCustom: '',
        address: null,
        addressText: '选择收货地址',
        addressList: [],
        showAddrPicker: false,
        selectedId: '',
        pickupCode: '',
        trackingNo: '',
        remark: '',
        attachments: [],
        sizeOptions: SIZE_OPTIONS,
        sizeQtys: { small: 0, medium: 0, large: 0 },
        totalAmount: '0.00',
        submitting: false,
    },
    onShow() {
        this.loadAddresses();
    },
    loadAddresses() {
        const list = (0, address_1.loadAddressesFromStorage)().map(address_1.decorateAddress);
        const defaultItem = list.find((a) => a.isDefault) || list[0] || null;
        this.setData({
            addressList: list,
            address: defaultItem,
            addressText: defaultItem ? `${defaultItem.receiverName} ${defaultItem.receiverPhone}` : '选择收货地址',
            selectedId: defaultItem ? String(defaultItem.id) : '',
        });
    },
    onPickupChange(e) {
        const index = Number(e.detail.value);
        this.setData({ pickupIndex: index, isCustomPickup: index === CUSTOM_INDEX });
    },
    getPickupPoint() {
        const d = this.data;
        if (d.isCustomPickup)
            return String(d.pickupCustom || '').trim();
        return d.pickupPoints[d.pickupIndex] || '';
    },
    onAddressTap() {
        this.setData({
            addressList: (0, address_1.loadAddressesFromStorage)().map(address_1.decorateAddress),
            showAddrPicker: true,
        });
    },
    onAddressSelect(e) {
        const id = String(e.currentTarget.dataset.id || '');
        const item = this.data.addressList.find((a) => String(a.id) === id);
        if (!item)
            return;
        this.setData({
            address: item,
            addressText: `${item.receiverName} ${item.receiverPhone}`,
            selectedId: id,
            showAddrPicker: false,
        });
    },
    onCloseAddrPicker() {
        this.setData({ showAddrPicker: false });
    },
    onAddAddress() {
        this.setData({ showAddrPicker: false });
        wx.navigateTo({ url: '/pages/address/address' });
    },
    onInput(e) {
        const field = e.currentTarget.dataset.field;
        const patch = {};
        patch[field] = e.detail.value;
        this.setData(patch);
    },
    onChooseAttachment() {
        const remain = 3 - this.data.attachments.length;
        if (remain <= 0) {
            wx.showToast({ title: '最多添加 3 张图片', icon: 'none' });
            return;
        }
        wx.chooseMedia({
            count: remain,
            mediaType: ['image'],
            sizeType: ['compressed'],
            success: (res) => {
                const files = (res.tempFiles || []).map((f) => ({ path: f.tempFilePath }));
                this.setData({ attachments: this.data.attachments.concat(files) });
            },
        });
    },
    onRemoveAttachment(e) {
        const index = Number(e.currentTarget.dataset.index);
        const list = this.data.attachments.slice();
        list.splice(index, 1);
        this.setData({ attachments: list });
    },
    onSizeAdd(e) {
        const key = e.currentTarget.dataset.key;
        const qtys = this.data.sizeQtys;
        qtys[key] = (qtys[key] || 0) + 1;
        this.setData({ sizeQtys: qtys });
        this.calcTotal();
    },
    onSizeMinus(e) {
        const key = e.currentTarget.dataset.key;
        const qtys = this.data.sizeQtys;
        if ((qtys[key] || 0) > 0)
            qtys[key] -= 1;
        this.setData({ sizeQtys: qtys });
        this.calcTotal();
    },
    calcTotal() {
        let total = 0;
        this.data.sizeOptions.forEach((opt) => {
            total += opt.price * (this.data.sizeQtys[opt.key] || 0);
        });
        this.setData({ totalAmount: total.toFixed(2) });
    },
    onSubmit() {
        if (this.data.submitting)
            return;
        const d = this.data;
        const address = d.address;
        if (!address) {
            wx.showToast({ title: '请选择收货地址', icon: 'none' });
            return;
        }
        if (!String(d.pickupCode || '').trim()) {
            wx.showToast({ title: '请填写取件码', icon: 'none' });
            return;
        }
        const pickupPoint = this.getPickupPoint();
        if (!pickupPoint) {
            wx.showToast({ title: '请填写取件点', icon: 'none' });
            return;
        }
        let totalQty = 0;
        d.sizeOptions.forEach((o) => {
            totalQty += d.sizeQtys[o.key] || 0;
        });
        if (totalQty <= 0) {
            wx.showToast({ title: '请选择快递大小', icon: 'none' });
            return;
        }
        this.setData({ submitting: true });
        void this.doSubmit({
            title: `快递代取 ${totalQty} 件`,
            description: `取件点：${pickupPoint}\n收货：${address.receiverName} ${address.receiverPhone}\n${address.addressText}\n合计：¥${d.totalAmount}`,
            type: 'EXPRESS',
            reward: Number.parseFloat(d.totalAmount) || 0,
            pickup: pickupPoint,
            delivery: address.addressText,
        });
    },
    doSubmit(draft, mode = 'order') {
        (0, order_flow_1.goOrderConfirm)(draft, mode);
        this.setData({ submitting: false });
    },
});
