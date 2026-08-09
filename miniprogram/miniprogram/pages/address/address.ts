interface AddressItem {
  id: string;
  school: string;
  receiverName: string;
  receiverPhone: string;
  dormitory: string;
  room: string;
  detail: string;
  isDefault: boolean;
}

const STORAGE_KEY = 'xypt_addresses';

const SCHOOLS = ['重庆工商职业学院', '重庆工商职业学院 · 合川校区'];

function loadAddresses(): AddressItem[] {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    return Array.isArray(raw) ? (raw as AddressItem[]) : [];
  } catch {
    return [];
  }
}

function saveAddresses(list: AddressItem[]): void {
  wx.setStorageSync(STORAGE_KEY, list);
}

function decorateAddress(item: AddressItem) {
  const parts: string[] = [];
  if (item.school) parts.push(item.school);
  if (item.dormitory) parts.push(item.dormitory);
  if (item.room) parts.push(item.room);
  if (item.detail) parts.push(item.detail);
  return Object.assign({}, item, { addressText: parts.join(' ') });
}

Page({
  data: {
    mode: 'list',
    addresses: [] as AddressItem[],
    schools: SCHOOLS,
    schoolIndex: 0,
    formId: '',
    receiverName: '',
    receiverPhone: '',
    dormitory: '',
    room: '',
    detail: '',
    isDefault: false,
    submitting: false,
  },

  onShow() {
    this.loadAddresses();
  },

  loadAddresses() {
    this.setData({ addresses: loadAddresses().map(decorateAddress) });
  },

  onShowForm(e?: WechatMiniprogram.TouchEvent) {
    const dataset = e && e.currentTarget.dataset ? e.currentTarget.dataset : {};
    const id = dataset.id ? String(dataset.id) : '';
    let item: AddressItem | null = null;
    if (id) {
      item = this.data.addresses.find((a) => String(a.id) === id) || null;
    }
    if (item) {
      let schoolIndex = 0;
      const idx = SCHOOLS.indexOf(item.school);
      if (idx >= 0) schoolIndex = idx;
      this.setData({
        mode: 'form',
        formId: item.id,
        schoolIndex,
        receiverName: item.receiverName,
        receiverPhone: item.receiverPhone,
        dormitory: item.dormitory,
        room: item.room,
        detail: item.detail,
        isDefault: item.isDefault,
      });
    } else {
      this.setData({
        mode: 'form',
        formId: '',
        schoolIndex: 0,
        receiverName: '',
        receiverPhone: '',
        dormitory: '',
        room: '',
        detail: '',
        isDefault: this.data.addresses.length === 0,
      });
    }
  },

  onBackToList() {
    this.setData({ mode: 'list' });
  },

  onInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as string;
    const patch: Record<string, string> = {};
    patch[field] = e.detail.value;
    this.setData(patch);
  },

  onSchoolChange(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value) || 0;
    this.setData({ schoolIndex: index });
  },

  onDefaultSwitchChange(e: WechatMiniprogram.SwitchChange) {
    this.setData({ isDefault: !!e.detail.value });
  },

  onSetDefault(e: WechatMiniprogram.TouchEvent) {
    const id = String(e.currentTarget.dataset.id || '');
    if (!id) return;
    const list = loadAddresses().map((a) => Object.assign({}, a, { isDefault: String(a.id) === id }));
    saveAddresses(list);
    wx.showToast({ title: '已设为默认', icon: 'success' });
    this.loadAddresses();
  },

  onEdit(e: WechatMiniprogram.TouchEvent) {
    this.onShowForm(e);
  },

  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = String(e.currentTarget.dataset.id || '');
    if (!id) return;
    const self = this;
    wx.showModal({
      title: '删除地址',
      content: '确定删除这条收货地址吗？',
      confirmColor: '#ff7a2f',
      success(res) {
        if (!res.confirm) return;
        const list = loadAddresses().filter((a) => String(a.id) !== id);
        saveAddresses(list);
        wx.showToast({ title: '已删除', icon: 'success' });
        self.loadAddresses();
      },
    });
  },

  onSave() {
    if (this.data.submitting) return;
    const name = String(this.data.receiverName || '').trim();
    const phone = String(this.data.receiverPhone || '').trim();
    if (!name) {
      wx.showToast({ title: '请填写收货人姓名', icon: 'none' });
      return;
    }
    if (!phone) {
      wx.showToast({ title: '请填写手机号', icon: 'none' });
      return;
    }
    const isDefault = this.data.isDefault;
    const item: AddressItem = {
      id: this.data.formId || `addr_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      school: SCHOOLS[this.data.schoolIndex] || SCHOOLS[0],
      receiverName: name,
      receiverPhone: phone,
      dormitory: String(this.data.dormitory || '').trim(),
      room: String(this.data.room || '').trim(),
      detail: String(this.data.detail || '').trim(),
      isDefault,
    };
    const list = loadAddresses();
    const next = this.data.formId
      ? list.map((a) => (String(a.id) === item.id ? item : Object.assign({}, a, { isDefault: isDefault ? false : a.isDefault })))
      : list.concat([item]).map((a) => Object.assign({}, a, { isDefault: isDefault ? String(a.id) === item.id : a.isDefault }));
    saveAddresses(next);
    wx.showToast({ title: '保存成功', icon: 'success' });
    this.setData({ mode: 'list', submitting: false });
    this.loadAddresses();
  },
});

export {};