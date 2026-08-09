"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_flow_1 = require("../../utils/order-flow");
const address_1 = require("../../utils/address");
const SERVICE_TAGS = ['菜鸟驿站（东门）', '菜鸟驿站（西门）', '丰巢快递柜（东门）', '丰巢快递柜（西门）', '校门口快递架'];
const SIZE_OPTIONS = [
    { key: 'small', name: '小件', desc: '文件、小包裹、信封', price: 3 },
    { key: 'medium', name: '中件', desc: '鞋盒、书本、小纸箱', price: 5 },
    { key: 'large', name: '大件', desc: '行李箱、大包裹、桶装物 · 大件加价', price: 8 },
];
Page({
    data: {
        address: null,
        addressList: [],
        showAddrPicker: false,
        selectedId: '',
        servicePoint: '',
        serviceTags: SERVICE_TAGS,
        returnCode: '',
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
    onServiceTagTap(e) {
        this.setData({ servicePoint: String(e.currentTarget.dataset.value || '') });
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
        const sizeQtys = this.data.sizeQtys;
        sizeQtys[key] = (sizeQtys[key] || 0) + 1;
        this.setData({ sizeQtys });
        this.calcTotal();
    },
    onSizeMinus(e) {
        const key = e.currentTarget.dataset.key;
        const sizeQtys = this.data.sizeQtys;
        if ((sizeQtys[key] || 0) > 0)
            sizeQtys[key] -= 1;
        this.setData({ sizeQtys });
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
        if (!String(d.servicePoint || '').trim()) {
            wx.showToast({ title: '请填写服务点', icon: 'none' });
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
            title: `快递代寄 ${totalQty} 件`,
            description: `送至：${d.servicePoint}\n退货码/单号：${d.returnCode}\n取货：${address.addressText}\n合计：¥${d.totalAmount}`,
            type: 'EXPRESS',
            reward: Number.parseFloat(d.totalAmount) || 0,
            pickup: address.addressText,
            delivery: d.servicePoint,
        });
    },
    doSubmit(draft, mode = 'order') {
        (0, order_flow_1.goOrderConfirm)(draft, mode);
        this.setData({ submitting: false });
    },
});
