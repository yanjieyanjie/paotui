import { request } from './request';
import { getCurrentUserId } from '../utils/account';
import type { ChatMessage, Conversation, Message } from '../types';

export function getMessages(unreadOnly = false): Promise<Message[]> {
  return request<Message[]>({ url: '/messages', data: { unreadOnly, userId: getCurrentUserId() } });
}

export function readMessage(id: number): Promise<Message> {
  return request<Message>({ url: `/messages/${id}/read`, method: 'PATCH' });
}

export function getConversations(): Promise<Conversation[]> {
  return request<Conversation[]>({
    url: '/messages/conversations',
    data: { userId: getCurrentUserId() },
  });
}

export function getChatMessages(orderId: number, otherUserId: number): Promise<ChatMessage[]> {
  return request<ChatMessage[]>({
    url: '/messages/conversation',
    data: { userId: getCurrentUserId(), orderId, otherUserId },
  });
}

export function sendChatMessage(
  orderId: number,
  otherUserId: number,
  content: string,
  type = 'text',
): Promise<ChatMessage> {
  return request<ChatMessage>({
    url: '/messages',
    method: 'POST',
    data: { userId: otherUserId, fromUserId: getCurrentUserId(), orderId, content, type },
  });
}

export function readConversation(
  orderId: number,
  otherUserId: number,
): Promise<{ count: number }> {
  return request<{ count: number }>({
    url: '/messages/read',
    method: 'PATCH',
    data: { userId: getCurrentUserId(), orderId, otherUserId },
  });
}