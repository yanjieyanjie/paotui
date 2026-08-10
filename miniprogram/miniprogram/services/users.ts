import { request } from './request';
import type { User, UserStats } from '../types';

export function getDemoUser(): Promise<User> {
  return request<User>({ url: '/users/demo' });
}

export function getUser(id: number): Promise<User> {
  return request<User>({ url: `/users/${id}` });
}

export function getUsers(): Promise<User[]> {
  return request<User[]>({ url: '/users' });
}

export function getUserStats(id: number): Promise<UserStats> {
  return request<UserStats>({ url: `/users/${id}/stats` });
}

export interface UpdateUserPayload {
  nickname?: string;
  phone?: string;
  major?: string;
  gender?: 'male' | 'female';
  avatar?: string;
  isRunner?: boolean;
}

export function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  return request<User>({ url: `/users/${id}`, method: 'PATCH', data: payload });
}