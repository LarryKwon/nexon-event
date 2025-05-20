import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// 보상 타입 Enum (예시)
export enum RewardType {
  POINTS = 'POINTS',
  ITEM = 'ITEM',
  COUPON = 'COUPON',
  VIRTUAL_CURRENCY = 'VIRTUAL_CURRENCY',
  // ... 기타 보상 타입
}

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true, collection: 'rewards' })
export class Reward {
  // 이 보상이 연결된 이벤트의 ID (Event 스키마의 _id 참조)
  // "각 보상은 어떤 이벤트와 연결되는지가 명확해야 합니다." (문서 4페이지, source 22, 61)
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
  eventId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // 보상 이름 (예: "1000 메이플포인트", "전설 무기 상자")

  @Prop({ trim: true })
  description?: string; // 보상 설명

  @Prop({ required: true, type: String, enum: RewardType })
  type: RewardType; // 보상 종류 (예: 포인트, 아이템, 쿠폰)

  // 보상 상세 내용: 타입에 따라 다른 정보를 저장할 수 있는 유연한 객체
  // "DB 스키마로는 어떤 보상인지 명확히 표현되어야 합니다." (문서 5페이지, source 31, 70, 109)
  @Prop({ type: Object, required: true })
  details: Record<string, any>; // 예: { amount: 1000 } for POINTS, { itemId: 'abc', itemName: '레어 아이템' } for ITEM

  @Prop({ required: true, min: 0 })
  quantity: number; // 총 지급 가능 수량 (0이면 무제한 또는 다른 로직으로 해석 가능)

  @Prop({ default: 0, min: 0 })
  claimedCount: number; // 현재까지 지급된 수량 (재고 관리에 사용)

  // 자동 생성되는 타임스탬프 (createdAt, updatedAt)
  createdAt?: Date;
  updatedAt?: Date;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);