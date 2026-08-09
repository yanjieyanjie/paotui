/// <reference types="miniprogram-api-typings" />

import { User } from '../miniprogram/types';

declare global {
  interface IAppOption {
    globalData: {
      user: User | null;
      hallQuery?: { type?: string; keyword?: string } | undefined;
    };
  }
}

export {};