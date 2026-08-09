import { goOrderConfirm } from '../../utils/order-flow';
import type { OrderDraft } from '../../utils/order-flow';

import { loadAddressesFromStorage, decorateAddress, loadDefaultAddress } from '../../utils/address';
import type { DisplayAddress } from '../../utils/address';

type FloorKey = 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6';

interface FloorItem {
  key: FloorKey;
  name: string;
  desc: string;
  price: number;
}

const GENDER_OPTIONS = ['不限', '仅男生', '仅女生'];

const FLOORS: FloorItem[] = [
  { key: 'f1', name: '1 楼', desc: '免搬运费', price: 12 },
  { key: 'f2', name: '2 楼', desc: '每桶 +1 元', price: 13 },
  { key: 'f3', name: '3 楼', desc: '每桶 +2 元', price: 14 },
  { key: 'f4', name: '4 楼', desc: '每桶 +3 元', price: 15 },
  { key: 'f5', name: '5 楼', desc: '每桶 +4 元', price: 16 },
  { key: 'f6', name: '6 楼', desc: '每桶 +5 元', price: 17 },
];

const INIT_QTYS: Record<FloorKey, number> = { f1: 0, f2: 0, f3: 0, f4: 0, f5: 0, f6: 0 };

Page({
  data: {
    address: null as DisplayAddress | null,
    addressList: [] as DisplayAddress[],
    showAddrPicker: false,
    selectedId: '',
    genderOptions: GENDER_OPTIONS,
    genderIndex: 0,
    floors: FLOORS,
    qtys: { ...INIT_QTYS },
    totalAmount: '0.00',
    totalCount: 0,
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

  onGenderTap(e: WechatMiniprogram.TouchEvent) {
    this.setData({ genderIndex: Number(e.currentTarget.dataset.index) });
  },

  onAdd(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as FloorKey;
    const qtys = this.data.qtys;
    qtys[key] = (qtys[key] || 0) + 1;
    this.setData({ qtys });
    this.calcTotal();
  },

  onMinus(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as FloorKey;
    const qtys = this.data.qtys;
    if ((qtys[key] || 0) > 0) qtys[key] -= 1;
    this.setData({ qtys });
    this.calcTotal();
  },

  calcTotal() {
    let total = 0;
    let count = 0;
    this.data.floors.forEach((f) => {
      const qty = this.data.qtys[f.key] || 0;
      total += f.price * qty;
      count += qty;
    });
    this.setData({ totalAmount: total.toFixed(2), totalCount: count });
  },

  onSubmit() {
    if (this.data.submitting) return;
    const d = this.data;
    const address = d.address;
    if (!address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }

    if (d.totalCount <= 0) {
      wx.showToast({ title: '请选择送水桶数', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    const genderValue = d.genderIndex === 1 ? 'male' : d.genderIndex === 2 ? 'female' : undefined;
        void this.doSubmit({
          title: `搬水 ${d.totalCount} 桶`,
          description: `性别限制：${d.genderOptions[d.genderIndex]}\n代搬：${address.addressText}\n合计：¥${d.totalAmount}`,
          type: 'OTHER',
          reward: Number.parseFloat(d.totalAmount) || 0,
          delivery: address.addressText,
          gender: genderValue,
        });
  },

  doSubmit(draft: OrderDraft, mode: 'order' | 'publish' = 'order') {
    goOrderConfirm(draft, mode);
    this.setData({ submitting: false });
  },
});

export {};
