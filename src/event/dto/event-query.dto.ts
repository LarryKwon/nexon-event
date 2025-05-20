import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from './enum';

export class EventQueryDto {
  @ApiPropertyOptional({ enum: EventStatus, description: '이벤트 상태 필터' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ description: '검색어 (이벤트 이름 또는 설명)' })
  @IsOptional()
  @IsString()
  search?: string;

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
  @Max(100) // 너무 많은 데이터 요청 방지
  limit?: number = 10;

  @ApiPropertyOptional({ description: '정렬 기준 필드', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string; // 예: 'createdAt', 'startDate', 'name'

  @ApiPropertyOptional({
    description: '정렬 순서 (ASC 또는 DESC)',
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
