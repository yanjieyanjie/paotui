"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_flow_1 = require("../../utils/order-flow");
const GENDER_OPTIONS = [
    { key: 'male', label: '仅限男生' },
    { key: 'female', label: '仅限女生' },
    { key: 'any', label: '不限' },
];
const MIN_REWARD = 5;
Page({
    data: {
        helpContent: '',
        detailContent: '',
        genderOptions: GENDER_OPTIONS,
        gender: 'any',
        attachments: [],
        reward: MIN_REWARD,
        minReward: MIN_REWARD,
        totalAmount: MIN_REWARD.toFixed(2),
        submitting: false,
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
        if (!String(d.helpContent || '').trim()) {
            wx.showToast({ title: '请填写帮助内容', icon: 'none' });
            return;
        }
        if (!String(d.detailContent || '').trim()) {
            wx.showToast({ title: '请填写具体内容', icon: 'none' });
            return;
        }
        const genderLabel = d.genderOptions.find((g) => g.key === d.gender)?.label || '不限';
        this.setData({ submitting: true });
        const helpText = String(d.helpContent || '').trim();
        void this.doSubmit({
            title: `万能任务：${helpText.length > 20 ? helpText.slice(0, 20) + '…' : helpText}`,
            description: `具体内容：${d.detailContent}\n性别：${genderLabel}\n赏金：¥${d.reward}`,
            type: 'OTHER',
            reward: Number(d.reward) || 0,
            gender: d.gender === 'any' ? undefined : d.gender,
        }, 'publish');
    },
    doSubmit(draft, mode = 'order') {
        (0, order_flow_1.goOrderConfirm)(draft, mode);
        this.setData({ submitting: false });
    },
});
