import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardRequestStatus, RewardType } from '../../event/dto/enum';

// 지급된 보상 정보를 간략히 포함할 경우
class ClaimedRewardInfo {
  @ApiProperty()
  rewardId: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ enum: RewardType })
  type: RewardType;
  @ApiProperty()
  details: Record<string, any>;
}

export class RewardRequestResponseDto {
  @ApiProperty({ example: '605c72ef97910a001f16a29c' })
  _id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  rewardId: string;

  @ApiProperty({ enum: RewardRequestStatus })
  status: RewardRequestStatus;

  @ApiPropertyOptional()
  failureReason?: string;

  @ApiPropertyOptional()
  processedAt?: Date;

  @ApiPropertyOptional({
    type: ClaimedRewardInfo,
    description: '실제로 지급된 보상 정보 (성공 시)',
  })
  claimedRewardDetails?: ClaimedRewardInfo; // 스키마의 claimedRewardDetails를 구체화

  @ApiProperty()
  createdAt: Date; // 요청 시각

  @ApiProperty()
  updatedAt: Date;
}
