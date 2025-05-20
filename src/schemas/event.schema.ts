import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// 이벤트 상태를 위한 Enum
export enum EventStatus {
  UPCOMING = 'UPCOMING', // 예정
  ACTIVE = 'ACTIVE',     // 진행중
  INACTIVE = 'INACTIVE',   // 비활성 (운영자가 수동으로 중단)
  ENDED = 'ENDED',       // 종료 (기간 만료)
}

// 이벤트 조건 타입을 위한 Enum (예시)
// 실제로는 더 복잡한 구조나 외부 시스템 연동이 필요할 수 있습니다.
// "이벤트 종류와 조건 로직은 자유롭게 정하셔도 됩니다." (문서 4페이지, source 27, 66, 105)
export enum EventConditionType {
  LOGIN_STREAK = 'LOGIN_STREAK', // 연속 로그인
  FRIEND_INVITE = 'FRIEND_INVITE', // 친구 초대
  QUEST_CLEAR = 'QUEST_CLEAR',   // 특정 퀘스트 클리어
  MANUAL = 'MANUAL',             // 수동 조건 (운영자 판단)
  // ... 기타 조건 타입
}

export type EventDocument = Event & Document;

@Schema({ timestamps: true, collection: 'events' })
export class Event {
  @Prop({ required: true, trim: true })
  name: string; // 이벤트 이름

  @Prop({ trim: true })
  description?: string; // 이벤트 설명

  @Prop({ required: true, type: String, enum: EventStatus, default: EventStatus.UPCOMING })
  status: EventStatus; // 이벤트 상태 (예: 활성, 비활성, 종료 등)

  @Prop({ required: true })
  startDate: Date; // 이벤트 시작일

  @Prop({ required: true })
  endDate: Date; // 이벤트 종료일

  // 이벤트 조건: "로그인 3일, 친구 초대 등" (문서 3페이지, source 19, 58)
  // 이 부분은 요구사항에 따라 매우 유연하게 설계될 수 있습니다.
  // 간단하게는 문자열 설명, 복잡하게는 JSON 객체 형태로 조건을 정의할 수 있습니다.
  @Prop({ type: Object })
  conditions?: {
    type: EventConditionType | string; // 조건 타입 (Enum 또는 커스텀 문자열)
    details: Record<string, any>;    // 조건 상세 (예: { days: 3 } for LOGIN_STREAK)
    description?: string;             // 조건에 대한 사용자 친화적 설명
  };

  // 이벤트 생성자 ID (Auth Server의 User ID를 문자열로 저장)
  // MSA 환경에서는 직접적인 ObjectId 참조보다 ID 문자열 저장이 일반적입니다.
  @Prop({ required: true })
  createdBy: string; // 운영자 또는 관리자 ID (Auth Server의 User _id)

  // 이벤트에 연결된 보상 ID 목록 (Reward 스키마의 _id 참조)
  // @Prop({ type: [{ type: Types.ObjectId, ref: 'Reward' }] })
  // rewards: Types.ObjectId[]; // 이렇게 하거나, Reward 스키마에서 EventId를 갖도록 할 수 있습니다. (후자가 더 일반적)

  // 자동 생성되는 타임스탬프 (createdAt, updatedAt)
  createdAt?: Date;
  updatedAt?: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ status: 1, startDate: -1, endDate: -1 });
EventSchema.index({ createdBy: 1 });