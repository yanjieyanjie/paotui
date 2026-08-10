"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = require("../../services/users");
const account_1 = require("../../utils/account");
const SCHOOLS = ['重庆工商职业学院', '重庆工商职业学院 · 合川校区'];
Page({
    data: {
        name: '',
        phone: '',
        schools: SCHOOLS,
        schoolIndex: 0,
        submitting: false,
    },
    onNameInput(e) {
        this.setData({ name: e.detail.value });
    },
    onPhoneInput(e) {
        this.setData({ phone: e.detail.value });
    },
    onSchoolChange(e) {
        this.setData({ schoolIndex: Number(e.detail.value) || 0 });
    },
    async onSubmit() {
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
        try {
            await (0, users_1.updateUser)((0, account_1.getCurrentUserId)(), { isRunner: true });
            wx.showToast({ title: '认证成功，快去接单吧', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 1000);
        }
        catch {
            wx.showToast({ title: '提交失败，请确认后端已启动', icon: 'none' });
            this.setData({ submitting: false });
        }
    },
});
