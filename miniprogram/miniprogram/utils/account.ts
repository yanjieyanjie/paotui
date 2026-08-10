import { DEMO_USER_ID } from './config';

const CURRENT_USER_KEY = 'currentUserId';

export function getCurrentUserId(): number {
  try {
    const id = wx.getStorageSync<number>(CURRENT_USER_KEY);
    return typeof id === 'number' && id > 0 ? id : DEMO_USER_ID;
  } catch {
    return DEMO_USER_ID;
  }
}

export function setCurrentUserId(id: number) {
  try {
    wx.setStorageSync(CURRENT_USER_KEY, id);
  } catch {
    // 忽略存储异常
  }
}