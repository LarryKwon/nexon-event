import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsString,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RewardRequestStatus } from '../../event/dto/enum';

export class RewardRequestQueryDto {
  @ApiPropertyOptional({
    description: '특정 사용자 ID로 필터링 (관리자/운영자용)',
  })
  @IsOptional()
  @IsString() // 또는 IsMongoId 만약 Auth Server의 userId가 ObjectId 형태라면
  userId?: string;

  @ApiPropertyOptional({ description: '특정 이벤트 ID로 필터링' })
  @IsOptional()
  @IsMongoId()
  eventId?: string;

  @ApiPropertyOptional({ description: '특정 보상 ID로 필터링' })
  @IsOptional()
  @IsMongoId()
  rewardId?: string;

  @ApiPropertyOptional({
    enum: RewardRequestStatus,
    description: '요청 상태 필터',
  })
  @IsOptional()
  @IsEnum(RewardRequestStatus)
  status?: RewardRequestStatus;

  @ApiPropertyOptional({
    description: '조회 시작일 (ISO 8601 형식, createdAt 기준)',
    example: '2025-06-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: '조회 종료일 (ISO 8601 형식, createdAt 기준)',
    example: '2025-06-30T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '페이지 번호', default: 1, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지 당 항목 수',
    default: 10,
    type: Number,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '정렬 기준 필드', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string; // 예: 'createdAt', 'processedAt'

  @ApiPropertyOptional({
    description: '정렬 순서 (ASC 또는 DESC)',
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
