import {
  getChatMessages,
  readConversation,
  sendChatMessage,
} from '../../services/messages';
import { getCurrentUserId } from '../../utils/account';
import { formatTime } from '../../utils/format';
import { getUser } from '../../services/users';
import { getOrder } from '../../services/orders';
import { ORDER_STATUS_LABELS } from '../../types/index';
import type { ChatMessage } from '../../types';

const POLL_INTERVAL = 3000;
let pollTimer = 0;
let recorder: WechatMiniprogram.RecorderManager | null = null;
let audioPlayer: WechatMiniprogram.InnerAudioContext | null = null;
let playingId = 0;

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#ff9f43',
  PAYMENT_PENDING: '#ff9f43',
  ACCEPTED: '#2f9de8',
  COMPLETION_PENDING: '#ad6800',
  DONE: '#07c160',
  CANCELLED: '#8a8a8a',
};

const QUICK_PHRASES = [
  '好的',
  '收到',
  '马上到',
  '在路上了',
  '辛苦了',
  '麻烦确认一下完成',
  '我到了，在哪里碰头？',
  '好的，谢谢',
];

interface ChatLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface DisplayChatMessage extends ChatMessage {
  mine: boolean;
  timeText: string;
  avatarText: string;
  imageSrc: string;
  location: ChatLocation | null;
}

Page({
  data: {
    orderId: 0,
    otherUserId: 0,
    otherNickname: '',
    orderTitle: '',
    messages: [] as DisplayChatMessage[],
    input: '',
    loading: true,
    scrollIntoView: '',
    orderStatus: '',
    orderStatusLabel: '',
    orderStatusColor: '',
    voiceMode: false,
    showQuick: false,
    showMore: false,
    quickPhrases: QUICK_PHRASES,
    recording: false,
    playingId: 0,
  },

  onLoad(options: Record<string, string>) {
    this.setData({
      orderId: Number(options.orderId) || 0,
      otherUserId: Number(options.otherUserId) || 0,
    });
    this.loadMessages();
    this.loadOrder();
    this.loadPeer();
  },

  onShow() {
    if (!pollTimer) {
      pollTimer = setInterval(() => {
        this.loadMessages(true);
        this.loadOrder();
      }, POLL_INTERVAL) as unknown as number;
    }
  },

  onHide() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = 0;
    }
    this.stopAudio();
  },

  onUnload() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = 0;
    }
    this.stopAudio();
    recorder = null;
  },

  stopAudio() {
    if (audioPlayer) {
      audioPlayer.destroy();
      audioPlayer = null;
      playingId = 0;
      this.setData({ playingId: 0 });
    }
  },

  async loadMessages(silent = false) {
    const { orderId, otherUserId } = this.data;
    if (!orderId || !otherUserId) {
      this.setData({ loading: false });
      return;
    }
    try {
      const list = await getChatMessages(orderId, otherUserId);
      const me = getCurrentUserId();
      const items: DisplayChatMessage[] = list.map((item) => ({
        ...item,
        mine: item.fromUserId === me,
        timeText: formatTime(item.createdAt),
        avatarText: item.fromUser?.nickname?.charAt(0) || '?',
        imageSrc: item.type === 'image' ? item.content : '',
        location: item.type === 'location' ? this.parseLocation(item.content) : null,
      }));
      const lastId = items.length > 0 ? `msg-${items[items.length - 1].id}` : '';
      const grew = items.length > this.data.messages.length;
      const otherMsg = list.find((m) => m.fromUserId === otherUserId);
      this.setData({
        messages: items,
        loading: false,
        otherNickname: this.data.otherNickname || otherMsg?.fromUser?.nickname || '',
        scrollIntoView: lastId && (this.data.messages.length === 0 || grew) ? lastId : this.data.scrollIntoView,
      });
      readConversation(orderId, otherUserId).catch(() => undefined);
    } catch {
      this.setData({ loading: false });
      if (!silent) {
        wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
      }
    }
  },

  parseLocation(content: string): ChatLocation | null {
    try {
      const obj = JSON.parse(content);
      if (obj && typeof obj.latitude === 'number' && typeof obj.longitude === 'number') {
        return {
          name: String(obj.name || ''),
          address: String(obj.address || ''),
          latitude: obj.latitude,
          longitude: obj.longitude,
        };
      }
    } catch {
      // 解析失败按普通文本处理
    }
    return null;
  },

  async loadOrder() {
    const { orderId } = this.data;
    if (!orderId) {
      return;
    }
    try {
      const order = await getOrder(orderId);
      this.setData({
        orderTitle: order?.title || this.data.orderTitle,
        orderStatus: order?.status || '',
        orderStatusLabel: order?.status
          ? ORDER_STATUS_LABELS[order.status] || order.status
          : '',
        orderStatusColor: order?.status
          ? STATUS_COLORS[order.status] || '#2f9de8'
          : '',
      });
    } catch {
      // 忽略：订单信息获取失败时保留现有显示
    }
  },

  async loadPeer() {
    const { otherUserId, otherNickname } = this.data;
    if (otherNickname || !otherUserId) {
      return;
    }
    try {
      const user = await getUser(otherUserId);
      if (user?.nickname) {
        this.setData({ otherNickname: user.nickname });
      }
    } catch {
      // 忽略：昵称暂不可用时显示“对方”
    }
  },

  onInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ input: String(e.detail?.value ?? '') });
  },

  async onSend() {
    const content = this.data.input.trim();
    if (!content) {
      return;
    }
    this.setData({ input: '' });
    await this.sendContent(content, 'text');
  },

  async sendContent(content: string, type: string) {
    const { orderId, otherUserId } = this.data;
    if (!content || !orderId || !otherUserId) {
      return;
    }
    try {
      const created = await sendChatMessage(orderId, otherUserId, content, type);
      this.appendMessage(created);
    } catch (err) {
      wx.showToast({ title: (err as Error).message || '发送失败', icon: 'none' });
    }
  },

  appendMessage(created: ChatMessage) {
    const me = getCurrentUserId();
    const item: DisplayChatMessage = {
      ...created,
      mine: created.fromUserId === me,
      timeText: formatTime(created.createdAt),
      avatarText: created.fromUser?.nickname?.charAt(0) || '?',
      imageSrc: created.type === 'image' ? created.content : '',
      location: created.type === 'location' ? this.parseLocation(created.content) : null,
    };
    this.setData({
      messages: [...this.data.messages, item],
      scrollIntoView: `msg-${item.id}`,
    });
  },

  toggleVoice() {
    this.setData({
      voiceMode: !this.data.voiceMode,
      showQuick: false,
      showMore: false,
    });
  },

  toggleQuick() {
    this.setData({ showQuick: !this.data.showQuick, showMore: false });
  },

  toggleMore() {
    this.setData({ showMore: !this.data.showMore, showQuick: false });
  },

  onQuickTap(e: WechatMiniprogram.TouchEvent) {
    const { text } = e.currentTarget.dataset as { text: string };
    if (!text) {
      return;
    }
    const current = this.data.input;
    this.setData({
      input: current ? `${current}${text}` : text,
      showQuick: false,
    });
  },

  chooseAlbum() {
    this.chooseAndSendImage(['album']);
  },

  chooseCamera() {
    this.chooseAndSendImage(['camera']);
  },

  chooseAndSendImage(sourceType: ('album' | 'camera')[]) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType,
      sizeType: ['compressed'],
      success: (res) => {
        const file = res.tempFiles[0];
        if (file) {
          this.compressAndSendImage(file.tempFilePath);
        }
      },
      fail: () => undefined,
    });
  },

  compressAndSendImage(src: string) {
    const readAndSend = (path: string) => {
      const fs = wx.getFileSystemManager();
      fs.readFile({
        filePath: path,
        encoding: 'base64',
        success: async (readRes) => {
          const ext = (path.split('.').pop() || 'jpeg').toLowerCase();
          const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
          await this.sendContent(`data:${mime};base64,${readRes.data}`, 'image');
        },
        fail: () => wx.showToast({ title: '图片读取失败', icon: 'none' }),
      });
    };
    wx.compressImage({
      src,
      quality: 60,
      success: (res) => readAndSend(res.tempFilePath),
      fail: () => readAndSend(src),
    });
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        if (!res || typeof res.latitude !== 'number' || typeof res.longitude !== 'number') {
          return;
        }
        const content = JSON.stringify({
          name: res.name || '',
          address: res.address || '',
          latitude: res.latitude,
          longitude: res.longitude,
        });
        this.setData({ showMore: false });
        this.sendContent(content, 'location');
      },
      fail: () => undefined,
    });
  },

  getRecorder(): WechatMiniprogram.RecorderManager {
    if (!recorder) {
      recorder = wx.getRecorderManager();
      recorder.onStop((res) => {
        this.setData({ recording: false });
        if (!res || !res.tempFilePath) {
          return;
        }
        const fs = wx.getFileSystemManager();
        fs.readFile({
          filePath: res.tempFilePath,
          encoding: 'base64',
          success: async (readRes) => {
            await this.sendContent(String(readRes.data), 'audio');
          },
          fail: () => wx.showToast({ title: '语音读取失败', icon: 'none' }),
        });
      });
      recorder.onError(() => {
        this.setData({ recording: false });
        wx.showToast({ title: '录音失败，请重试', icon: 'none' });
      });
    }
    return recorder;
  },

  startRecord() {
    if (this.data.recording) {
      return;
    }
    this.getRecorder().start({ duration: 60000, format: 'aac' });
    this.setData({ recording: true });
  },

  stopRecord() {
    if (this.data.recording) {
      this.getRecorder().stop();
    }
  },

  togglePlay(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset as { id: number };
    const item = this.data.messages.find((m) => m.id === id);
    if (!item || item.type !== 'audio' || !item.content) {
      return;
    }
    if (playingId === id && audioPlayer) {
      this.stopAudio();
      return;
    }
    const filePath = `${wx.env.USER_DATA_PATH}/chat_audio_${id}.aac`;
    const fs = wx.getFileSystemManager();
    fs.writeFile({
      filePath,
      data: item.content,
      encoding: 'base64',
      success: () => {
        if (audioPlayer) {
          audioPlayer.destroy();
        }
        const player = wx.createInnerAudioContext();
        audioPlayer = player;
        playingId = id;
        this.setData({ playingId: id });
        player.src = filePath;
        player.onEnded(() => {
          if (audioPlayer === player) {
            audioPlayer = null;
            playingId = 0;
            this.setData({ playingId: 0 });
          }
        });
        player.onError(() => {
          if (audioPlayer === player) {
            audioPlayer = null;
            playingId = 0;
            this.setData({ playingId: 0 });
          }
          wx.showToast({ title: '语音播放失败', icon: 'none' });
        });
        player.play();
      },
      fail: () => wx.showToast({ title: '语音加载失败', icon: 'none' }),
    });
  },

  onLocationTap(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset as { index: number };
    const item = this.data.messages[index];
    if (!item?.location) {
      return;
    }
    wx.openLocation({
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      name: item.location.name || '',
      address: item.location.address || '',
      scale: 16,
    });
  },

  onOrderTap() {
    const { orderId } = this.data;
    if (orderId) {
      wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${orderId}` });
    }
  },
});

export {};