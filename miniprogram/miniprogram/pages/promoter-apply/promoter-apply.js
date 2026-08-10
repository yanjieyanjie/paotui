"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Page({
    data: {
        name: '',
        phone: '',
        remark: '',
        submitting: false,
    },
    onNameInput(e) {
        this.setData({ name: e.detail.value });
    },
    onPhoneInput(e) {
        this.setData({ phone: e.detail.value });
    },
    onRemarkInput(e) {
        this.setData({ remark: e.detail.value });
    },
    onSubmit() {
        if (this.data.submitting)
            return;
        const name = this.data.name.trim();
        const phone = this.data.phone.trim();
        if (!name) {
            wx.showToast({ title: '请输入姓名', icon: 'none' });
            return;
        }
        if (!/^1\d{10}$/.test(phone)) {
            wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
            return;
        }
        this.setData({ submitting: true });
        wx.showToast({ title: '申请成功，请等待审核', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1000);
    },
});
