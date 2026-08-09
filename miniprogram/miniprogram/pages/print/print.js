"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_flow_1 = require("../../utils/order-flow");
const address_1 = require("../../utils/address");
const PRINT_STYLES = [
    { key: 'bw-single', name: '黑白单面', desc: '¥0.2/张', price: 0.2 },
    { key: 'bw-double', name: '黑白双面', desc: '¥0.3/张', price: 0.3 },
    { key: 'color-single', name: '彩色单面', desc: '¥0.5/张', price: 0.5 },
    { key: 'color-double', name: '彩色双面', desc: '¥0.8/张', price: 0.8 },
];
const MIN_FEE = 3;
const MAX_PAGES = 500;
Page({
    data: {
        address: null,
        addressList: [],
        showAddrPicker: false,
        selectedId: '',
        files: [],
        attachments: [],
        pages: 1,
        printStyles: PRINT_STYLES,
        styleKey: '',
        deliveryFee: MIN_FEE,
        minFee: MIN_FEE,
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
    onChooseFile() {
        const remain = 3 - this.data.files.length;
        if (remain <= 0) {
            wx.showToast({ title: '最多添加 3 个文件', icon: 'none' });
            return;
        }
        wx.chooseMessageFile({
            count: remain,
            type: 'file',
            success: (res) => {
                const files = (res.tempFiles || []).map((f) => ({
                    name: f.name || '未命名文件',
                    path: f.path,
                }));
                this.setData({ files: this.data.files.concat(files) });
            },
        });
    },
    onRemoveFile(e) {
        const index = Number(e.currentTarget.dataset.index);
        const list = this.data.files.slice();
        list.splice(index, 1);
        this.setData({ files: list });
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
    onPagesMinus() {
        const pages = Math.max(1, this.data.pages - 1);
        this.setData({ pages });
        this.calcTotal();
    },
    onPagesPlus() {
        const pages = Math.min(MAX_PAGES, this.data.pages + 1);
        this.setData({ pages });
        this.calcTotal();
    },
    onStyleTap(e) {
        const key = String(e.currentTarget.dataset.key || '');
        this.setData({ styleKey: key });
        this.calcTotal();
    },
    onFeeMinus() {
        const fee = Math.max(MIN_FEE, this.data.deliveryFee - 1);
        this.setData({ deliveryFee: fee });
        this.calcTotal();
    },
    onFeePlus() {
        this.setData({ deliveryFee: this.data.deliveryFee + 1 });
        this.calcTotal();
    },
    calcTotal() {
        const style = this.data.printStyles.find((s) => s.key === this.data.styleKey);
        const printFee = style ? style.price * this.data.pages : 0;
        const total = printFee + this.data.deliveryFee;
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
        if (d.files.length + d.attachments.length <= 0) {
            wx.showToast({ title: '请上传打印文件或图片', icon: 'none' });
            return;
        }
        if (!d.styleKey) {
            wx.showToast({ title: '请选择打印样式', icon: 'none' });
            return;
        }
        this.setData({ submitting: true });
        const styleName = d.printStyles.find((s) => s.key === d.styleKey)?.name || d.styleKey;
        void this.doSubmit({
            title: `打印代送 ${d.pages} 张`,
            description: `打印样式：${styleName}\n文件：${d.files.length} 个 / 图片：${d.attachments.length} 张\n收货：${address.addressText}\n合计：¥${d.totalAmount}`,
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
