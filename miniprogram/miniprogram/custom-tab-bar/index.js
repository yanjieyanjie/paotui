Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '首页' },
      { pagePath: '/pages/hall/hall', text: '接单大厅' },
      { pagePath: '/pages/sell/sell', text: '卖闲置' },
      { pagePath: '/pages/messages/messages', text: '消息列表' },
      { pagePath: '/pages/mine/mine', text: '我的' }
    ]
  },
  methods: {
    onTabTap(e) {
      const index = Number(e.currentTarget.dataset.index);
      wx.switchTab({ url: this.data.list[index].pagePath });
    },
    onCenterTap() {
      wx.switchTab({ url: this.data.list[2].pagePath });
    }
  }
});