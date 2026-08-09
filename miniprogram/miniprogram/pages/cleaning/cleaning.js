"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_flow_1 = require("../../utils/order-flow");
const address_1 = require("../../utils/address");
const GENDER_OPTIONS = ['不限', '仅男生', '仅女生'];
const PRODUCTS = [
    { key: 'whole', name: '全屋清洁', icon: '🏠', price: 39, desc: '全屋地面、桌面、床铺整体清洁', bg: 'linear-gradient(135deg, #fff3e6 0%, #ffe0c2 100%)' },
    { key: 'balcony', name: '阳台清洁', icon: '🌤️', price: 15, desc: '阳台地面、栏杆、杂物整理清洁', bg: 'linear-gradient(135deg, #e8f7ff 0%, #d2eefe 100%)' },
    { key: 'toilet', name: '厕所清洁', icon: '🚽', price: 19, desc: '马桶、洗手台、地面深度清洁', bg: 'linear-gradient(135deg, #e6f7ec 0%, #ccefda 100%)' },
];
Page({
    data: {
        address: null,
        addressList: [],
        showAddrPicker: false,
        selectedId: '',
        genderOptions: GENDER_OPTIONS,
        genderIndex: 0,
        attachments: [],
        products: PRODUCTS,
        qtys: { whole: 0, balcony: 0, toilet: 0 },
        totalAmount: '0.00',
        totalCount: 0,
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
    onGenderTap(e) {
        this.setData({ genderIndex: Number(e.currentTarget.dataset.index) });
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
    onAdd(e) {
        const key = e.currentTarget.dataset.key;
        const qtys = this.data.qtys;
        qtys[key] = (qtys[key] || 0) + 1;
        this.setData({ qtys });
        this.calcTotal();
    },
    onMinus(e) {
        const key = e.currentTarget.dataset.key;
        const qtys = this.data.qtys;
        if ((qtys[key] || 0) > 0)
            qtys[key] -= 1;
        this.setData({ qtys });
        this.calcTotal();
    },
    calcTotal() {
        let total = 0;
        let count = 0;
        this.data.products.forEach((p) => {
            const qty = this.data.qtys[p.key] || 0;
            total += p.price * qty;
            count += qty;
        });
        this.setData({ totalAmount: total.toFixed(2), totalCount: count });
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
        if (d.totalCount <= 0) {
            wx.showToast({ title: '请选择清洁规模', icon: 'none' });
            return;
        }
        this.setData({ submitting: true });
        const genderValue = d.genderIndex === 1 ? 'male' : d.genderIndex === 2 ? 'female' : undefined;
        void this.doSubmit({
            title: `清洁服务 ${d.totalCount} 项`,
            description: `清洁规模：${d.totalCount} 项\n性别限制：${d.genderOptions[d.genderIndex]}\n清洁地址：${address.addressText}\n合计：¥${d.totalAmount}`,
            type: 'OTHER',
            reward: Number.parseFloat(d.totalAmount) || 0,
            delivery: address.addressText,
            gender: genderValue,
        });
    },
    doSubmit(draft, mode = 'order') {
        (0, order_flow_1.goOrderConfirm)(draft, mode);
        this.setData({ submitting: false });
    },
});
