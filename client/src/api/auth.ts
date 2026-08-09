import api from './axios';
import type { User } from '../types';

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
  localStorage.setItem('upi_relay_token', data.token);
  return data.user;
}

export async function logout() {
  await api.post('/auth/logout');
  localStorage.removeItem('upi_relay_token');
}

export async function me() {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}

export async function inviteMember(name: string, email: string, password: string) {
  const { data } = await api.post<{ user: User }>('/auth/invite', { name, email, password });
  return data.user;
}
