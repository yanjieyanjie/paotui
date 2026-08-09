"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_flow_1 = require("../../utils/order-flow");
const address_1 = require("../../utils/address");
const PICKUP_TAGS = ['一食堂', '二食堂', '三食堂', '商业街', '校门口'];
const MIN_REWARD = 3;
Page({
    data: {
        address: null,
        addressList: [],
        showAddrPicker: false,
        selectedId: '',
        pickupPlace: '',
        pickupTags: PICKUP_TAGS,
        pickupInfo: '',
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
    onPickupTagTap(e) {
        this.setData({ pickupPlace: String(e.currentTarget.dataset.value || '') });
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
        if (!String(d.pickupPlace || '').trim()) {
            wx.showToast({ title: '请填写取餐地点', icon: 'none' });
            return;
        }
        if (!String(d.pickupInfo || '').trim()) {
            wx.showToast({ title: '请填写取餐信息', icon: 'none' });
            return;
        }
        this.setData({ submitting: true });
        void this.doSubmit({
            title: `代拿外卖：${d.pickupPlace}`,
            description: `取餐：${d.pickupPlace}（${d.pickupInfo}）\n收货：${address.addressText}\n赏金：¥${d.reward}`,
            type: 'FOOD',
            reward: Number(d.reward) || 0,
            pickup: d.pickupPlace,
            delivery: address.addressText,
        });
    },
    doSubmit(draft, mode = 'order') {
        (0, order_flow_1.goOrderConfirm)(draft, mode);
        this.setData({ submitting: false });
    },
});
