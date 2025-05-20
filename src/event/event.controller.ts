import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator'; // 경로 확인
import { EventResponseDto } from './dto/event-response.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // 경로 확인 (Event Server 내 Auth 관련 모듈)
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';
import { EventDocument } from '../schemas/event.schema';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';

// Helper function to map EventDocument to EventResponseDto
// 이 함수는 컨트롤러 파일 내에 두거나, 별도의 매퍼 유틸리티로 분리할 수 있습니다.
function mapEventToResponseDto(event: EventDocument): EventResponseDto {
  // EventDocument를 EventResponseDto로 변환합니다.
  // toObject()를 사용하여 Mongoose 문서를 순수 객체로 변환하고, _id를 문자열로 변환합니다.
  const eventObject = event.toObject
    ? event.toObject({ virtuals: true })
    : event;
  return {
    _id: eventObject._id?.toString(),
    name: eventObject.name,
    description: eventObject.description,
    status: eventObject.status,
    startDate: eventObject.startDate,
    endDate: eventObject.endDate,
    conditions: eventObject.conditions, // EventConditionsResponseDto 형태로 변환 필요시 추가 작업
    createdBy: eventObject.createdBy,
    // rewards: eventObject.rewards?.map(r => mapRewardToResponseDto(r)), // 만약 rewards를 populate 했다면
    createdAt: eventObject.createdAt,
    updatedAt: eventObject.updatedAt,
  };
}

@ApiBearerAuth()
@Controller('/events') // Event Server 내부 기본 경로
@UseGuards(JwtAuthGuard) // 컨트롤러 레벨에서 JWT 인증 적용
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // Gateway에서 OPERATOR, ADMIN 역할 검증 가정
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventResponseDto> {
    const event = await this.eventService.create(createEventDto, user);
    return mapEventToResponseDto(event);
  }

  @Get()
  // Gateway에서 모든 인증된 사용자 접근 가능 가정
  async findAllEvents(
    @Query() query: EventQueryDto,
  ): Promise<{ data: EventResponseDto[]; count: number }> {
    const { data, count } = await this.eventService.findAll(query);
    return {
      data: data.map(mapEventToResponseDto),
      count,
    };
  }

  @Get(':eventId')
  // Gateway에서 모든 인증된 사용자 접근 가능 가정
  async findOneEvent(
    @Param('eventId', ParseObjectIdPipe) eventId: string, // MongoDB ObjectId 유효성 검사
  ): Promise<EventResponseDto> {
    const event = await this.eventService.findOne(eventId);
    return mapEventToResponseDto(event);
  }

  @Put(':eventId')
  // Gateway에서 OPERATOR, ADMIN 역할 검증 가정
  async updateEvent(
    @Param('eventId', ParseObjectIdPipe) eventId: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventService.update(eventId, updateEventDto);
    return mapEventToResponseDto(event);
  }

  @Delete(':eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  // Gateway에서 ADMIN 역할 검증 가정
  async removeEvent(
    @Param('eventId', ParseObjectIdPipe) eventId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.eventService.remove(eventId, user);
  }
}
