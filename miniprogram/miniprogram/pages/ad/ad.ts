interface AdContent {
  icon: string;
  title: string;
  subtitle: string;
  points: string[];
  cta: string;
  cls: string;
}

const ADS: Record<string, AdContent> = {
  driving: {
    icon: '🚗',
    title: '学校附近最便宜驾校',
    subtitle: '学生团报 · 低价学车 · 考试无忧',
    points: [
      'C1 / C2 任选，一人一车一教练',
      '宿舍楼下免费接送，练车不奔波',
      '考试不过免费补考，直到拿证',
    ],
    cta: '立即报名',
    cls: 'ad-driving',
  },
  training: {
    icon: '🎓',
    title: '最优质培训机构',
    subtitle: '名师小班 · 随到随学 · 考证无忧',
    points: [
      '名师小班授课，学习效率更高',
      '考证 / 考研 / 技能培训一站式',
      '免费试听一节课，满意再报名',
    ],
    cta: '免费试听',
    cls: 'ad-training',
  },
};

Page({
  data: {
    ad: null as AdContent | null,
  },

  onLoad(options: Record<string, string>) {
    const ad = ADS[options.type || ''] || null;
    this.setData({ ad });
    wx.setNavigationBarTitle({
      title: ad?.title || '广告详情',
    });
  },

  onCta() {
    wx.showModal({
      title: '报名成功',
      content: '已收到你的报名，我们会尽快联系你，请留意消息通知～',
      showCancel: false,
      confirmText: '好的',
    });
  },
});

export {};