import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// 보상 요청 처리 상태 Enum
export enum RewardRequestStatus {
  PENDING = 'PENDING',     // 처리 대기 중 (예: 운영자 검토 필요 시)
  SUCCESS = 'SUCCESS',     // 지급 성공
  FAILED_CONDITION_NOT_MET = 'FAILED_CONDITION_NOT_MET', // 조건 미충족으로 실패
  FAILED_ALREADY_CLAIMED = 'FAILED_ALREADY_CLAIMED', // 이미 지급받음으로 실패
  FAILED_OUT_OF_STOCK = 'FAILED_OUT_OF_STOCK',   // 재고 부족으로 실패
  FAILED_EVENT_INACTIVE = 'FAILED_EVENT_INACTIVE', // 이벤트 비활성/종료로 실패
  FAILED_ERROR = 'FAILED_ERROR',         // 기타 시스템 오류로 실패
}

export type RewardRequestDocument = RewardRequest & Document;

@Schema({ timestamps: true, collection: 'reward_requests' })
export class RewardRequest {
  // 보상을 요청한 사용자의 ID (Auth Server의 User _id)
  @Prop({ required: true, index: true })
  userId: string;

  // 요청 대상 이벤트의 ID (Event 스키마의 _id 참조)
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
  eventId: Types.ObjectId;

  // 요청 대상 보상의 ID (Reward 스키마의 _id 참조)
  // 이벤트에 여러 보상이 있을 경우 특정 보상을 지정할 수 있습니다.
  // 만약 이벤트의 첫 번째/기본 보상을 의미한다면 optional일 수 있습니다.
  @Prop({ type: Types.ObjectId, ref: 'Reward', required: true }) // 하나의 이벤트에 여러 보상이 있을 수 있으므로 특정 보상을 지칭
  rewardId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: RewardRequestStatus, default: RewardRequestStatus.PENDING })
  status: RewardRequestStatus; // 요청 처리 상태

  @Prop({ trim: true })
  failureReason?: string; // 지급 실패 시 사유

  @Prop()
  processedAt?: Date; // 요청이 최종 처리된 시각 (성공/실패 결정 시각)

  // 실제로 지급된 보상에 대한 정보 (선택적, 로깅 목적)
  // 예: 지급 시점의 보상 스냅샷 또는 지급된 아이템의 고유 ID 등
  @Prop({ type: Object })
  claimedRewardDetails?: Record<string, any>;

  // 자동 생성되는 타임스탬프 (createdAt은 요청 시각으로 활용, updatedAt)
  createdAt?: Date; // 이 필드가 "요청 시각"이 됩니다.
  updatedAt?: Date;
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);

// 중복 보상 요청 방지를 위한 복합 인덱스 (userId, eventId, rewardId)
RewardRequestSchema.index({ userId: 1, eventId: 1, rewardId: 1, status: 1 }); // 성공한 요청에 대한 중복 방지
RewardRequestSchema.index({ status: 1, createdAt: -1 }); // 상태 및 생성일 기준 조회 최적화