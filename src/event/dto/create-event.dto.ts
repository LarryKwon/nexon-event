import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  ValidateNested,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventConditionType, EventStatus } from "./enum";

class EventConditionDetailsDto {
  // 이 부분은 이벤트 조건에 따라 매우 다양해질 수 있습니다.
  // 예시: LOGIN_STREAK의 경우
  @ApiPropertyOptional({
    description: '로그인 조건의 경우 연속 출석 일수',
    example: 7,
  })
  @IsOptional()
  @IsNotEmpty()
  days?: number;

  // 예시: QUEST_CLEAR의 경우
  @ApiPropertyOptional({
    description: '퀘스트 클리어 조건의 경우 퀘스트 ID',
    example: 'quest_123',
  })
  @IsOptional()
  @IsString()
  questId?: string;

  // 기타 조건별 상세 필드들...
  [key: string]: any; // 유연성을 위해 추가 인덱스 시그니처
}

class EventConditionsDto {
  @ApiProperty({
    enum: EventConditionType,
    description: '이벤트 조건 타입',
    example: EventConditionType.LOGIN_STREAK,
  })
  @IsEnum(EventConditionType)
  @IsNotEmpty()
  type: EventConditionType | string; // string 허용 시 커스텀 타입 가능

  @ApiPropertyOptional({
    type: EventConditionDetailsDto,
    description: '이벤트 조건 상세 내용',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested() // 중첩된 객체 유효성 검사
  @Type(() => EventConditionDetailsDto)
  details?: EventConditionDetailsDto;

  @ApiPropertyOptional({
    description: '조건에 대한 사용자 친화적 설명',
    example: '7일 연속 로그인 달성 시',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateEventDto {
  @ApiProperty({
    description: '이벤트 이름',
    example: '봄맞이 출석 이벤트',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: '이벤트 설명',
    example: '매일 출석하고 푸짐한 보상을 받으세요!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: EventStatus,
    description: '이벤트 초기 상태',
    default: EventStatus.UPCOMING,
    example: EventStatus.ACTIVE,
  })
  @IsOptional() // 생성 시 기본값(예: UPCOMING)을 서비스에서 설정할 수도 있음
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({
    description: '이벤트 시작일 (ISO 8601 형식)',
    example: '2025-06-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string; // 또는 Date 타입 (class-transformer로 변환 필요)

  @ApiProperty({
    description: '이벤트 종료일 (ISO 8601 형식)',
    example: '2025-06-30T23:59:59.999Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string; // 또는 Date 타입

  @ApiPropertyOptional({ type: EventConditionsDto, description: '이벤트 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => EventConditionsDto)
  conditions?: EventConditionsDto;
}
