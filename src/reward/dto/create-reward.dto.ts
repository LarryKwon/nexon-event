import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RewardType } from "../../event/dto/enum";

class RewardDetailsDto {
  // 이 부분은 보상 타입에 따라 매우 다양해질 수 있습니다.
  @ApiPropertyOptional({ description: '포인트 보상 시 지급량', example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({
    description: '아이템 보상 시 아이템 코드',
    example: 'SWORD_001',
  })
  @IsOptional()
  @IsString()
  itemId?: string;

  @ApiPropertyOptional({
    description: '아이템 보상 시 아이템 이름 (참고용)',
    example: '전설의 검',
  })
  @IsOptional()
  @IsString()
  itemName?: string; // DB에 저장 안 할 수도 있음

  @ApiPropertyOptional({ description: '아이템 보상 시 지급 수량', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  itemQuantity?: number;

  // 기타 보상 타입별 상세 필드들...
  [key: string]: any; // 유연성을 위해 추가 인덱스 시그니처
}

export class CreateRewardDto {
  // eventId는 경로 파라미터로 받으므로 DTO에는 포함하지 않음

  @ApiProperty({
    description: '보상 이름',
    example: '1000 포인트 지급',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: '보상 설명',
    example: '이벤트 참여 완료 시 즉시 지급',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: RewardType,
    description: '보상 타입',
    example: RewardType.POINTS,
  })
  @IsEnum(RewardType)
  @IsNotEmpty()
  type: RewardType;

  @ApiProperty({
    type: RewardDetailsDto,
    description: '보상 상세 내용 (타입에 따라 구조 상이)',
  })
  @IsObject()
  @IsNotEmpty()
  @Type(() => RewardDetailsDto) // class-transformer가 타입을 알 수 있도록
  details: RewardDetailsDto;

  @ApiProperty({
    description: '총 지급 가능 수량 (0이면 무제한 또는 다른 의미)',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  quantity: number;
}
