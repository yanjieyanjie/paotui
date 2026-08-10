import { updateUser } from '../../services/users';
import { getCurrentUserId } from '../../utils/account';

const SCHOOLS = ['重庆工商职业学院', '重庆工商职业学院 · 合川校区'];

Page({
  data: {
    name: '',
    phone: '',
    schools: SCHOOLS,
    schoolIndex: 0,
    submitting: false,
  },

  onNameInput(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value });
  },

  onPhoneInput(e: WechatMiniprogram.Input) {
    this.setData({ phone: e.detail.value });
  },

  onSchoolChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ schoolIndex: Number(e.detail.value) || 0 });
  },

  async onSubmit() {
    if (this.data.submitting) return;
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
      await updateUser(getCurrentUserId(), { isRunner: true });
      wx.showToast({ title: '认证成功，快去接单吧', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch {
      wx.showToast({ title: '提交失败，请确认后端已启动', icon: 'none' });
      this.setData({ submitting: false });
    }
  },
});

export {};