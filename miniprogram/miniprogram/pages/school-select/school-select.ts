interface School {
  name: string;
  icon: string;
  lat: number;
  lng: number;
}

interface SchoolWithDistance extends School {
  distance: number;
}

interface OtherSchool {
  name: string;
  icon: string;
  distanceText: string;
}

const SCHOOLS: School[] = [
  { name: '重庆工商职业学院', icon: '🏫', lat: 29.6, lng: 106.3 },
  { name: '重庆工商职业学院 · 合川校区', icon: '🎓', lat: 29.97, lng: 106.26 },
  { name: '重庆大学', icon: '🏛️', lat: 29.574, lng: 106.461 },
  { name: '西南大学', icon: '🌿', lat: 29.824, lng: 106.42 },
  { name: '重庆邮电大学', icon: '📡', lat: 29.53, lng: 106.59 },
  { name: '重庆交通大学', icon: '🛤️', lat: 29.52, lng: 106.57 },
  { name: '重庆理工大学', icon: '⚙️', lat: 29.402, lng: 106.533 },
  { name: '重庆师范大学', icon: '📚', lat: 29.604, lng: 106.302 },
];

const SELECTED_SCHOOL_KEY = 'selectedSchool';

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

Page({
  data: {
    keyword: '',
    currentSchool: '',
    location: null as { lat: number; lng: number } | null,
    others: [] as OtherSchool[],
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const current =
      wx.getStorageSync<string>(SELECTED_SCHOOL_KEY) || SCHOOLS[0].name;
    this.setData({ currentSchool: current });
    this.applyFilter();
    this.locate();
  },

  locate() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({ location: { lat: res.latitude, lng: res.longitude } });
        this.applyFilter();
      },
      fail: () => {
        this.setData({ location: null });
        this.applyFilter();
      },
    });
  },

  onSearchInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ keyword: String(e.detail ?? '') });
    this.applyFilter();
  },

  applyFilter() {
    const keyword = this.data.keyword.trim();
    const current = this.data.currentSchool;
    const { location } = this.data;
    let list: SchoolWithDistance[] = SCHOOLS.map((s) => ({
      ...s,
      distance: location
        ? distanceMeters(location.lat, location.lng, s.lat, s.lng)
        : 0,
    }));
    if (keyword) {
      list = list.filter((s) => s.name.indexOf(keyword) >= 0);
    }
    if (location) {
      list.sort((a, b) => a.distance - b.distance);
    }
    const others: OtherSchool[] = list
      .filter((s) => s.name !== current)
      .map((s) => ({
        name: s.name,
        icon: s.icon,
        distanceText: location ? formatDistance(s.distance) : '',
      }));
    this.setData({ others });
  },

  onSelect(e: WechatMiniprogram.TouchEvent) {
    const { name } = e.currentTarget.dataset as { name: string };
    if (!name) {
      return;
    }
    wx.setStorageSync(SELECTED_SCHOOL_KEY, name);
    wx.showToast({ title: `已选择「${name}」`, icon: 'none' });
    setTimeout(() => wx.navigateBack(), 600);
  },
});

export {};