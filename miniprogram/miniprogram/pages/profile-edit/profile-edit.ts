import { getUser, getUsers, updateUser } from '../../services/users';
import { getCurrentUserId, setCurrentUserId } from '../../utils/account';

const GENDER_OPTIONS = [
  { key: '', label: '未设置' },
  { key: 'male', label: '男' },
  { key: 'female', label: '女' },
];

Page({
  data: {
    userId: 0,
    nickname: '',
    phone: '',
    major: '',
    genderOptions: GENDER_OPTIONS,
    genderIndex: 0,
    avatar: '',
    avatarChar: '',
    loading: true,
    saving: false,
  },

  onLoad() {
    this.loadUser();
  },

  async loadUser() {
    try {
      const user = await getUser(getCurrentUserId());
      let genderIndex = 0;
      if (user.gender === 'male') {
        genderIndex = 1;
      } else if (user.gender === 'female') {
        genderIndex = 2;
      }
      this.setData({
        userId: user.id,
        nickname: user.nickname,
        phone: user.phone || '',
        major: user.major || '',
        genderIndex,
        avatar: user.avatar || '',
        avatarChar: user.nickname.charAt(0),
        loading: false,
      });
    } catch {
      wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
    }
  },

  onNicknameInput(e: WechatMiniprogram.Input) {
    this.setData({ nickname: e.detail.value });
  },

  onPhoneInput(e: WechatMiniprogram.Input) {
    this.setData({ phone: e.detail.value });
  },

  onMajorInput(e: WechatMiniprogram.Input) {
    this.setData({ major: e.detail.value });
  },

  onGenderChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ genderIndex: Number(e.detail.value) || 0 });
  },

  async onSwitchAccount() {
    if (this.data.loading) return;
    try {
      const accounts = await getUsers();
      const items = accounts.map((a) =>
        a.nickname + (a.phone ? `（${a.phone}）` : ''),
      );
      wx.showActionSheet({
        itemList: items,
        success: (res) => {
          const account = accounts[res.tapIndex];
          if (account && account.id !== getCurrentUserId()) {
            setCurrentUserId(account.id);
            this.loadUser();
            wx.showToast({ title: `已切换为「${account.nickname}」`, icon: 'none' });
          }
        },
      });
    } catch {
      wx.showToast({ title: '获取账号列表失败', icon: 'none' });
    }
  },

  onChooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        const src = res.tempFiles[0] && res.tempFiles[0].tempFilePath;
        if (!src) return;
        wx.compressImage({
          src,
          quality: 30,
          success: (c) => {
            const fs = wx.getFileSystemManager();
            fs.readFile({
              filePath: c.tempFilePath,
              encoding: 'base64',
              success: (r) => {
                const dataUrl = `data:image/jpeg;base64,${r.data}`;
                this.setData({ avatar: dataUrl });
              },
              fail: () => wx.showToast({ title: '图片读取失败', icon: 'none' }),
            });
          },
          fail: () => wx.showToast({ title: '图片压缩失败', icon: 'none' }),
        });
      },
    });
  },

  async onSave() {
    if (this.data.saving) return;
    const nickname = this.data.nickname.trim();
    const phone = this.data.phone.trim();
    if (!nickname) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    const payload: {
      nickname: string;
      phone: string;
      major?: string;
      gender?: 'male' | 'female';
      avatar?: string;
    } = { nickname, phone };
    const major = this.data.major.trim();
    if (major) {
      payload.major = major;
    }
    const gender = this.data.genderOptions[this.data.genderIndex].key;
    if (gender) {
      payload.gender = gender as 'male' | 'female';
    }
    if (this.data.avatar) {
      payload.avatar = this.data.avatar;
    }
    this.setData({ saving: true });
    try {
      await updateUser(this.data.userId, payload);
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '保存失败', icon: 'none' });
      this.setData({ saving: false });
    }
  },
});

export {};