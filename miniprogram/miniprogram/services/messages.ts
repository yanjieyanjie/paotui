import { request } from './request';
import type { Message } from '../types';

export function getMessages(unreadOnly = false): Promise<Message[]> {
  return request<Message[]>({ url: '/messages', data: { unreadOnly } });
}

export function readMessage(id: number): Promise<Message> {
  return request<Message>({ url: `/messages/${id}/read`, method: 'PATCH' });
}