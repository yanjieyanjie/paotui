import { BASE_URL } from '../utils/config';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  url: string;
  method?: Method;
  data?: Record<string, any>;
}

interface ApiErrorBody {
  message?: string | string[];
}

export function request<T>(options: RequestOptions): Promise<T> {
  const source = options.data;
  const data: Record<string, any> = {};
  if (source) {
    Object.keys(source).forEach((key) => {
      const value = source[key];
      if (value !== undefined && value !== null && value !== '') {
        data[key] = value;
      }
    });
  }
  return new Promise<T>((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: (options.method ?? 'GET') as WechatMiniprogram.RequestOption['method'],
      data,
      timeout: 10000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
          return;
        }
        const body = res.data as ApiErrorBody | undefined;
        const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
        reject(new Error(message ?? `请求失败（${res.statusCode}）`));
      },
      fail: (err) => {
        reject(new Error(err.errMsg ?? '网络连接失败'));
      },
    });
  });
}