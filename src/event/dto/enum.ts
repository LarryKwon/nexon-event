// src/event/dto/enums.ts (예시)

// Event 스키마에서 가져옴
export enum EventStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ENDED = 'ENDED',
}

export enum EventConditionType {
  LOGIN_STREAK = 'LOGIN_STREAK',
  FRIEND_INVITE = 'FRIEND_INVITE',
  QUEST_CLEAR = 'QUEST_CLEAR',
  MANUAL = 'MANUAL',
}

// Reward 스키마에서 가져옴
export enum RewardType {
  POINTS = 'POINTS',
  ITEM = 'ITEM',
  COUPON = 'COUPON',
  VIRTUAL_CURRENCY = 'VIRTUAL_CURRENCY',
}

// RewardRequest 스키마에서 가져옴
export enum RewardRequestStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED_CONDITION_NOT_MET = 'FAILED_CONDITION_NOT_MET',
  FAILED_ALREADY_CLAIMED = 'FAILED_ALREADY_CLAIMED',
  FAILED_OUT_OF_STOCK = 'FAILED_OUT_OF_STOCK',
  FAILED_EVENT_INACTIVE = 'FAILED_EVENT_INACTIVE',
  FAILED_ERROR = 'FAILED_ERROR',
}

// Auth Server의 Role Enum (참고용, Event Server에서 직접 사용할 수도 있음)
export enum Role {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
}
