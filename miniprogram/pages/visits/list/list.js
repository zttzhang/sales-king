// pages/visits/list/list.js
const visitsApi = require('../../../api/visits');
const util = require('../../../utils/util');

Page({
   {
    visits: [],
    loading: false
  },

  onLoad() {
    this.loadVisits();
  },

  onPullDownRefresh() {
    this.loadVisits().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadVisits() {
    this.setData({ loading: true });

    try {
      const visits = await visitsApi.getVisits({
        from: util.getMonthStartDate(),
        to: util.getTodayDate()
      });
      
      // 格式化数据
      const formattedVisits = visits.map(v => ({
        ...v,
        visitTime: util.formatDate(v.visitTime, 'YYYY-MM-DD HH:mm'),
        resultText: this.getResultText(v.result)
      }));

      this.setData({
        visits: formattedVisits,
        loading: false
      });
    } catch (error) {
      console.error('加载拜访列表失败:', error);
      this.setData({ loading: false });
    }
  },

  getResultText(result) {
    const map = {
      intent: '有意向',
      ordered: '已下单',
      no_order: '未下单',
      other: '其他'
    };
    return map[result] || result;
  }
});