import api from './axios';
import type { RelayRequest, RequestStatus, Stats } from '../types';

export async function createRequest(rawQR: string, amountOverride?: number) {
  const { data } = await api.post<{ request: RelayRequest }>('/requests', { rawQR, amountOverride });
  return data.request;
}

export async function myRequests() {
  const { data } = await api.get<{ requests: RelayRequest[] }>('/requests/mine');
  return data.requests;
}

export async function getRequest(id: string) {
  const { data } = await api.get<{ request: RelayRequest }>(`/requests/${id}`);
  return data.request;
}

export async function listRequests(params: {
  status?: RequestStatus | 'all';
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<{ requests: RelayRequest[]; total: number; page: number; pages: number }>(
    '/requests',
    { params }
  );
  return data;
}

export async function getStats() {
  const { data } = await api.get<Stats>('/requests/stats/summary');
  return data;
}

export async function approveRequest(id: string) {
  const { data } = await api.post<{ request: RelayRequest }>(`/requests/${id}/approve`);
  return data.request;
}

export async function rejectRequest(id: string) {
  const { data } = await api.post<{ request: RelayRequest }>(`/requests/${id}/reject`);
  return data.request;
}

export async function markPaid(id: string) {
  const { data } = await api.post<{ request: RelayRequest }>(`/requests/${id}/paid`);
  return data.request;
}

export async function getPayLink(id: string) {
  const { data } = await api.get<{ link: string }>(`/requests/${id}/pay-link`);
  return data.link;
}

export async function deleteRequest(id: string) {
  await api.delete(`/requests/${id}`);
}

export function exportCsvUrl() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${baseURL}/requests/export/csv`;
}