import { request } from './request';
import type { Order, PageResult } from '../types';

export interface OrderQuery {
  status?: string;
  statuses?: string;
  type?: string;
  keyword?: string;
  gender?: string;
  acceptedById?: number;
  involvedUserId?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateOrderPayload {
  title: string;
  description?: string;
  type: string;
  reward: number;
  pickup?: string;
  delivery?: string;
  gender?: 'male' | 'female';
  creatorId?: number;
}

export function getOrders(query: OrderQuery = {}): Promise<PageResult<Order>> {
  return request<PageResult<Order>>({ url: '/orders', data: query });
}

export function getOrder(id: number): Promise<Order> {
  return request<Order>({ url: `/orders/${id}` });
}

export function acceptOrder(id: number, userId?: number): Promise<Order> {
  return request<Order>({ url: `/orders/${id}/accept`, method: 'PATCH', data: { userId } });
}

export function doneOrder(id: number): Promise<Order> {
  return request<Order>({ url: `/orders/${id}/done`, method: 'PATCH' });
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>({ url: '/orders', method: 'POST', data: payload });
}

export function payOrder(id: number): Promise<Order> {
  return request<Order>({ url: `/orders/${id}/pay`, method: 'POST' });
}

export function cancelOrder(id: number): Promise<Order> {
  return request<Order>({ url: `/orders/${id}/cancel`, method: 'PATCH' });
}

export function confirmOrder(id: number): Promise<Order> {
  return request<Order>({ url: `/orders/${id}/confirm`, method: 'PATCH' });
}