import { getUser } from '../services/users';
import { getCurrentUserId } from './account';

const IDENTITY_KEY = 'currentIdentity';

export type Identity = 'publisher' | 'runner';

export function getCurrentIdentity(): Identity {
  try {
    return wx.getStorageSync<string>(IDENTITY_KEY) === 'runner' ? 'runner' : 'publisher';
  } catch {
    return 'publisher';
  }
}

export function setCurrentIdentity(identity: Identity) {
  try {
    wx.setStorageSync(IDENTITY_KEY, identity);
  } catch {
    // 忽略存储异常
  }
}

// 抢单前校验身份：返回 true 表示可以继续抢单
export function ensureRunnerIdentity(): Promise<boolean> {
  return new Promise((resolve) => {
    if (getCurrentIdentity() === 'runner') {
      resolve(true);
      return;
    }
    getUser(getCurrentUserId())
      .then((user) => {
        if (user.isRunner) {
          wx.showModal({
            title: '切换身份',
            content: '你已认证为接单员，请切换为接单员身份后再抢单',
            confirmText: '切换并抢单',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                setCurrentIdentity('runner');
                resolve(true);
              } else {
                resolve(false);
              }
            },
            fail: () => resolve(false),
          });
        } else {
          wx.navigateTo({ url: '/pages/runner-apply/runner-apply' });
          resolve(false);
        }
      })
      .catch(() => resolve(true));
  });
}