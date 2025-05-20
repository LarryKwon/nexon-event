import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardType } from '../../event/dto/enum';

class RewardDetailsResponseDto {
  @ApiPropertyOptional()
  amount?: number;
  @ApiPropertyOptional()
  itemId?: string;
  @ApiPropertyOptional()
  itemName?: string;
  @ApiPropertyOptional()
  itemQuantity?: number;
  [key: string]: any;
}

export class RewardResponseDto {
  @ApiProperty({ example: '605c72ef97910a001f16a29b' })
  _id: string;

  @ApiProperty({ example: '605c72ef97910a001f16a29a' }) // 이 보상이 속한 이벤트 ID
  eventId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: RewardType })
  type: RewardType;

  @ApiProperty({ type: RewardDetailsResponseDto })
  details: RewardDetailsResponseDto;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  claimedCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
