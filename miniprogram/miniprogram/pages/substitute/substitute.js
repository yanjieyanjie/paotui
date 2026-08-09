"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_flow_1 = require("../../utils/order-flow");
const address_1 = require("../../utils/address");
const GENDER_OPTIONS = [
    { key: 'male', label: '仅限男生' },
    { key: 'female', label: '仅限女生' },
    { key: 'any', label: '不限' },
];
const MIN_REWARD = 10;
Page({
    data: {
        address: null,
        addressList: [],
        showAddrPicker: false,
        selectedId: '',
        serviceTime: '',
        servicePlace: '',
        serviceItem: '',
        genderOptions: GENDER_OPTIONS,
        gender: 'any',
        attachments: [],
        reward: MIN_REWARD,
        minReward: MIN_REWARD,
        totalAmount: MIN_REWARD.toFixed(2),
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
        this.setData({ gender: String(e.currentTarget.dataset.key || 'any') });
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
    onRewardMinus() {
        const reward = Math.max(MIN_REWARD, this.data.reward - 1);
        this.setData({ reward, totalAmount: reward.toFixed(2) });
    },
    onRewardPlus() {
        const reward = this.data.reward + 1;
        this.setData({ reward, totalAmount: reward.toFixed(2) });
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
        if (!String(d.serviceTime || '').trim()) {
            wx.showToast({ title: '请填写服务时间', icon: 'none' });
            return;
        }
        if (!String(d.servicePlace || '').trim()) {
            wx.showToast({ title: '请填写服务地点', icon: 'none' });
            return;
        }
        if (!String(d.serviceItem || '').trim()) {
            wx.showToast({ title: '请填写服务项目', icon: 'none' });
            return;
        }
        const genderLabel = d.genderOptions.find((g) => g.key === d.gender)?.label || '不限';
        this.setData({ submitting: true });
        void this.doSubmit({
            title: `代替服务：${d.serviceItem}`,
            description: `时间：${d.serviceTime}\n地点：${d.servicePlace}\n性别：${genderLabel}\n赏金：¥${d.reward}`,
            type: 'OTHER',
            reward: Number(d.reward) || 0,
            pickup: d.servicePlace,
            delivery: address.addressText,
            gender: d.gender === 'any' ? undefined : d.gender,
        }, 'publish');
    },
    doSubmit(draft, mode = 'order') {
        (0, order_flow_1.goOrderConfirm)(draft, mode);
        this.setData({ submitting: false });
    },
});
