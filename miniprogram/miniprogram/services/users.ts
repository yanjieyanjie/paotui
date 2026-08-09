import { request } from './request';
import type { User, UserStats } from '../types';

export function getDemoUser(): Promise<User> {
  return request<User>({ url: '/users/demo' });
}

export function getUserStats(id: number): Promise<UserStats> {
  return request<UserStats>({ url: `/users/${id}/stats` });
}