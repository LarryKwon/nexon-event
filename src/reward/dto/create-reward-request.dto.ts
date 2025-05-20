import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardRequestDto {
  @ApiProperty({
    description: '보상을 요청할 이벤트의 ID',
    example: '605c72ef97910a001f16a29a',
  })
  @IsNotEmpty()
  @IsMongoId({ message: '유효한 이벤트 ID 형식이 아닙니다.' })
  eventId: string;

  @ApiProperty({
    description: '요청할 특정 보상의 ID',
    example: '605c72ef97910a001f16a29b',
  })
  @IsNotEmpty()
  @IsMongoId({ message: '유효한 보상 ID 형식이 아닙니다.' })
  rewardId: string;
}
