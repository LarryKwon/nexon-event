import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventConditionType, EventStatus } from './enum';
import { RewardResponseDto } from '../../reward/dto/reward-response.dto';

class EventConditionDetailsResponseDto {
  @ApiPropertyOptional()
  days?: number;
  @ApiPropertyOptional()
  questId?: string;
  [key: string]: any;
}

class EventConditionsResponseDto {
  @ApiProperty({ enum: EventConditionType })
  type: EventConditionType | string;
  @ApiPropertyOptional({ type: EventConditionDetailsResponseDto })
  details?: EventConditionDetailsResponseDto;
  @ApiPropertyOptional()
  description?: string;
}

export class EventResponseDto {
  @ApiProperty({ example: '605c72ef97910a001f16a29a' })
  _id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: EventStatus })
  status: EventStatus;

  @ApiProperty()
  startDate: Date; // DB에서 Date 타입으로 가져오므로 그대로 사용

  @ApiProperty()
  endDate: Date;

  @ApiPropertyOptional({ type: EventConditionsResponseDto })
  conditions?: EventConditionsResponseDto;

  @ApiProperty()
  createdBy: string; // 사용자 ID

  @ApiPropertyOptional({
    type: [RewardResponseDto],
    description: '이벤트에 포함된 보상 목록 (상세 조회 시 포함 가능)',
  })
  rewards?: RewardResponseDto[]; // 이벤트 상세 조회 시 보상 정보도 함께 보낼 경우

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
