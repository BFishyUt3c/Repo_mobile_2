export interface ExchangeResponse {
  exchangeId: number;
  requesterId: number;
  requesterName: string;
  providerId: number;
  providerName: string;
  requestedProductId: number;
  requestedProductName: string;
  requestedProductImage: string;
  offeredProductId: number;
  offeredProductName: string;
  offeredProductImage: string;
  requestedAt: string;
  completedAt?: string;
  status: string;
}

export interface ExchangeRequest {
  requestedProductId: number;
  offeredProductId: number;
}

export interface ExchangeStatistics {
  totalExchanges: number;
  completedExchanges: number;
  pendingExchanges: number;
  rejectedExchanges: number;
}

export enum ExchangeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
} 