export enum DonationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface DonationResponseDto {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  donorId: number;
  donorName: string;
  receiverId?: number;
  receiverName?: string;
  productId: number;
  productName: string;
  donationDate: string;
  receivedDate?: string;
  status: DonationStatus;
  donationLocation: string;
  receiverNote?: string;
  donorNote?: string;
  pointsAwarded?: number;
}

export interface DonationSummaryDto {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  donorName: string;
  productName: string;
  donationDate: string;
  status: DonationStatus;
  donationLocation: string;
}

export interface DonationRequestDto {
  title: string;
  description: string;
  imageUrl: string;
  productId: number;
  donationLocation: string;
  donorNote?: string;
}

export interface DonationUpdateDto {
  status: DonationStatus;
  receiverNote?: string;
}

export interface DonationStatisticsDto {
  totalDonations: number;
  completedDonations: number;
  pendingDonations: number;
  cancelledDonations: number;
  totalPointsEarned: number;
} 