import type { User } from './types';

App<IAppOption>({
  globalData: {
    user: null as User | null,
  },
  onLaunch() {},
});