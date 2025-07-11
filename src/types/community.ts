export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  level: number;
  points: number;
}

export enum CommunityType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export interface CommunityRequestDto {
  name: string;
  description: string;
  type: CommunityType;
}

export interface CommunityResponseDto {
  id: number;
  name: string;
  description: string;
  creator: UserDto;
  members: UserDto[];
  createdAt: string;
  location: string;
  type: CommunityType;
  memberCount: number;
}

export interface CommunitySummaryDto {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  creator: UserDto;
  type: CommunityType;
}

export interface CommunitySearchDto {
  name?: string;
  location?: string;
  minMembers?: number;
  maxMembers?: number;
} 