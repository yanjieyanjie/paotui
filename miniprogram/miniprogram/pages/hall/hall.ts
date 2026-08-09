import { acceptOrder, getOrders } from '../../services/orders';
import { ORDER_TYPE_LABELS } from '../../types/index';
import { decorateOrders } from '../../utils/format';
import type { DisplayOrder } from '../../types/index';

const PAGE_SIZE = 10;

interface FilterOption {
  value: string;
  label: string;
}

interface PlaceOption {
  value: string;
  label: string;
  keywords: string[];
}

Page({
  data: {
    keyword: '',
    type: '',
    typeLabels: ORDER_TYPE_LABELS,
    serviceOptions: [
      { value: '', label: '服务' },
      { value: 'EXPRESS', label: '取快递' },
      { value: 'FOOD', label: '带饭' },
      { value: 'SHOPPING', label: '代买' },
      { value: 'OTHER', label: '其他' },
    ] as FilterOption[],
    serviceIndex: 0,

    placeOptions: [
      { value: '', label: '地点', keywords: [] },
      { value: '宿舍', label: '宿舍', keywords: ['宿舍'] },
      { value: '食堂', label: '食堂', keywords: ['食堂'] },
      { value: '校门口', label: '校门口', keywords: ['校门口'] },
      { value: '教学楼', label: '教学楼', keywords: ['教学楼'] },
      { value: '快递点', label: '快递点', keywords: ['快递', '驿站', '站点', '柜'] },
    ] as PlaceOption[],
    placeIndex: 0,
    genderOptions: [
      { value: '', label: '性别' },
      { value: 'male', label: '仅男生' },
      { value: 'female', label: '仅女生' },
    ] as FilterOption[],
    genderIndex: 0,
    orders: [] as DisplayOrder[],
    page: 1,
    total: 0,
    loading: false,
    finished: false,
  },

  onShow() {
    const tabBar = (this as any).getTabBar && (this as any).getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 1 });
    }

    const app = getApp<IAppOption>();
    const hallQuery = app.globalData.hallQuery;
    if (hallQuery) {
      app.globalData.hallQuery = undefined;
      const patch: Record<string, unknown> = {};
      if (hallQuery.type) {
        const idx = this.data.serviceOptions.findIndex((o) => o.value === hallQuery.type);
        if (idx >= 0) {
          patch.serviceIndex = idx;
          patch.type = hallQuery.type;
        }
      }
      if (hallQuery.keyword) {
        patch.keyword = hallQuery.keyword;
      }
      if (Object.keys(patch).length > 0) {
        this.setData(patch);
      }
    }
    this.resetAndLoad();
  },

  resetAndLoad() {
    this.setData({ page: 1, orders: [], total: 0, finished: false });
    this.loadOrders();
  },

  async loadOrders() {
    const { keyword, page, finished, loading, serviceIndex, placeIndex, genderIndex } = this.data;
    if (finished || loading) {
      return;
    }
    this.setData({ loading: true });
    try {
      const type = this.data.serviceOptions[serviceIndex].value;
      const gender = this.data.genderOptions[genderIndex].value;
      const res = await getOrders({ status: 'OPEN', type, gender, keyword, page, pageSize: PAGE_SIZE });
      let items = decorateOrders(res.items);
      const place = this.data.placeOptions[placeIndex];
      if (place.keywords.length > 0) {
        items = items.filter((o) => {
          const text = `${o.pickup || ''} ${o.delivery || ''}`;
          return place.keywords.some((kw) => text.includes(kw));
        });
      }
      const merged = page === 1 ? items : this.data.orders.concat(items);
      const exhausted = items.length === 0;
      this.setData({
        orders: merged,
        total: res.total,
        page: page + 1,
        finished: exhausted || merged.length >= res.total,
      });
    } catch {
      wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onSearchInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ keyword: String(e.detail || '') });
  },

  onSearch() {
    this.resetAndLoad();
  },

  onServiceChange(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value) || 0;
    this.setData({ serviceIndex: index, type: this.data.serviceOptions[index].value });
    this.resetAndLoad();
  },


  onPlaceChange(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value) || 0;
    this.setData({ placeIndex: index });
    this.resetAndLoad();
  },

  onGenderChange(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value) || 0;
    this.setData({ genderIndex: index });
    this.resetAndLoad();
  },

  onReachBottom() {
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.resetAndLoad();
    wx.stopPullDownRefresh();
  },

  onClearType() {
    this.setData({ type: '', serviceIndex: 0 });
    this.resetAndLoad();
  },

  onClearKeyword() {
    this.setData({ keyword: '' });
    this.resetAndLoad();
  },

  async onAccept(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset as { id: number };
    try {
      await acceptOrder(id);
      wx.showToast({ title: '接单成功', icon: 'success' });
      this.resetAndLoad();
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '接单失败', icon: 'none' });
    }
  },


});

export {};