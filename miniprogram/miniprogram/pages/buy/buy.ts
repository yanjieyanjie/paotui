import { goOrderConfirm } from '../../utils/order-flow';
import type { OrderDraft } from '../../utils/order-flow';

import { loadAddressesFromStorage, decorateAddress, loadDefaultAddress } from '../../utils/address';
import type { DisplayAddress } from '../../utils/address';

interface AttachmentItem {
  path: string;
}


const MIN_REWARD = 5;

Page({
  data: {
    address: null as DisplayAddress | null,
    addressList: [] as DisplayAddress[],
    showAddrPicker: false,
    selectedId: '',
    buyPlace: '',

    wantList: '',
    attachments: [] as AttachmentItem[],
    prepaid: '',
    reward: MIN_REWARD,
    minReward: MIN_REWARD,
    totalAmount: MIN_REWARD.toFixed(2),
    submitting: false,
  },


  onShow() {
    this.loadAddresses();
  },

  loadAddresses() {
    const defaultItem = loadDefaultAddress();
    this.setData({
      addressList: loadAddressesFromStorage().map(decorateAddress),
      address: defaultItem,
      selectedId: defaultItem ? String(defaultItem.id) : '',

    });
  },

  onAddressTap() {
    this.setData({
      addressList: loadAddressesFromStorage().map(decorateAddress),
      showAddrPicker: true,
    });
  },

  onAddressSelect(e: WechatMiniprogram.TouchEvent) {
    const id = String(e.currentTarget.dataset.id || '');
    const item = this.data.addressList.find((a) => String(a.id) === id);
    if (!item) return;
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
  onInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as string;
    const patch: Record<string, string> = {};
    patch[field] = e.detail.value;
    this.setData(patch);
  },


  onPrepaidInput(e: WechatMiniprogram.Input) {
    const value = e.detail.value;
    this.setData({ prepaid: value });
    this.calcTotal();
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

  onRemoveAttachment(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset.index);
    const list = this.data.attachments.slice();
    list.splice(index, 1);
    this.setData({ attachments: list });
  },

  onRewardMinus() {
    const reward = Math.max(MIN_REWARD, this.data.reward - 1);
    this.setData({ reward });
    this.calcTotal();
  },

  onRewardPlus() {
    this.setData({ reward: this.data.reward + 1 });
    this.calcTotal();
  },

  calcTotal() {
    const prepaidNum = Number.parseFloat(this.data.prepaid) || 0;
    const total = Math.max(0, prepaidNum) + this.data.reward;
    this.setData({ totalAmount: total.toFixed(2) });
  },

  onSubmit() {
    if (this.data.submitting) return;
    const d = this.data;
    const address = d.address;
    if (!address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }
    if (!String(d.buyPlace || '').trim()) {
      wx.showToast({ title: '请填写购买地址', icon: 'none' });
      return;
    }

    if (!String(d.wantList || '').trim()) {
      wx.showToast({ title: '请填写想买什么', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    const wantText = String(d.wantList || '').trim();
        void this.doSubmit({
          title: `商品代买：${wantText.length > 20 ? wantText.slice(0, 20) + '…' : wantText}`,
          description: `购买：${d.buyPlace}\n垫付：¥${Number.parseFloat(d.prepaid) || 0}\n收货：${address.addressText}\n合计：¥${d.totalAmount}`,
          type: 'SHOPPING',
          reward: Number.parseFloat(d.totalAmount) || 0,
          pickup: d.buyPlace,
          delivery: address.addressText,
        });
  },

  doSubmit(draft: OrderDraft, mode: 'order' | 'publish' = 'order') {
    goOrderConfirm(draft, mode);
    this.setData({ submitting: false });
  },
});

export {};