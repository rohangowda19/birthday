export type Role = 'admin' | 'member';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'expired';

export interface RelayRequest {
  _id: string;
  requester: User | string;
  merchantName: string;
  merchantUPI: string;
  amount: number;
  currency: string;
  transactionRef: string;
  transactionNote: string;
  merchantCode: string;
  rawQR: string;
  status: RequestStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  paidAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  todayRequests: number;
  todayPaid: number;
  pending: number;
  rejected: number;
  completed: number;
}

export interface ParsedUpi {
  merchantUPI: string;
  merchantName: string;
  amount: number | null;
  currency: string;
  transactionRef: string;
  transactionNote: string;
  merchantCode: string;
  rawUri: string;
}
