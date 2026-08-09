"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_flow_1 = require("../../utils/order-flow");
const address_1 = require("../../utils/address");
const WASH_OPTIONS = [
    { key: 'spin', name: '单脱', desc: '仅脱水，快捷省时', price: 3 },
    { key: 'fast', name: '快速', desc: '快速洗涤，约 30 分钟', price: 5 },
    { key: 'standard', name: '标准＋清洁漂洗', desc: '标准洗涤 + 清洁漂洗', price: 8 },
    { key: 'large', name: '大件＋清洁漂洗', desc: '床单被套等大件 + 清洁漂洗', price: 12 },
];
Page({
    data: {
        address: null,
        addressList: [],
        showAddrPicker: false,
        selectedId: '',
        attachments: [],
        washOptions: WASH_OPTIONS,
        washQtys: { spin: 0, fast: 0, standard: 0, large: 0 },
        totalAmount: '0.00',
        submitting: false,
    },
    onShow() {
        this.loadAddresses();
    },
    loadAddresses() {
        const defaultItem = (0, address_1.loadDefaultAddress)();
        this.setData({
            addressList: (0, address_1.loadAddressesFromStorage)().map(address_1.decorateAddress),
            address: defaultItem,
            selectedId: defaultItem ? String(defaultItem.id) : '',
        });
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
    onWashAdd(e) {
        const key = e.currentTarget.dataset.key;
        const washQtys = this.data.washQtys;
        washQtys[key] = (washQtys[key] || 0) + 1;
        this.setData({ washQtys });
        this.calcTotal();
    },
    onWashMinus(e) {
        const key = e.currentTarget.dataset.key;
        const washQtys = this.data.washQtys;
        if ((washQtys[key] || 0) > 0)
            washQtys[key] -= 1;
        this.setData({ washQtys });
        this.calcTotal();
    },
    calcTotal() {
        let total = 0;
        this.data.washOptions.forEach((opt) => {
            total += opt.price * (this.data.washQtys[opt.key] || 0);
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
        if (d.attachments.length <= 0) {
            wx.showToast({ title: '请上传放置门口的衣物照片', icon: 'none' });
            return;
        }
        let totalQty = 0;
        d.washOptions.forEach((o) => {
            totalQty += d.washQtys[o.key] || 0;
        });
        if (totalQty <= 0) {
            wx.showToast({ title: '请选择洗衣服务', icon: 'none' });
            return;
        }
        this.setData({ submitting: true });
        const serviceNames = d.washOptions
            .filter((o) => (d.washQtys[o.key] || 0) > 0)
            .map((o) => o.name)
            .join('、');
        void this.doSubmit({
            title: `洗衣代排队 ${totalQty} 项`,
            description: `服务：${serviceNames}\n收货：${address.addressText}\n合计：¥${d.totalAmount}`,
            type: 'OTHER',
            reward: Number.parseFloat(d.totalAmount) || 0,
            delivery: address.addressText,
        });
    },
    doSubmit(draft, mode = 'order') {
        (0, order_flow_1.goOrderConfirm)(draft, mode);
        this.setData({ submitting: false });
    },
});
