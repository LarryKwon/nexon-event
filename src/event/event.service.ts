import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { EventDocument, EventStatus } from '../schemas/event.schema'; // 경로 확인

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    user: AuthenticatedUser,
  ): Promise<EventDocument> {
    const newEvent = new this.eventModel({
      ...createEventDto,
      createdBy: user._id, // 이벤트 생성자 ID 기록
      status: createEventDto.status || EventStatus.UPCOMING, // DTO에 status가 없으면 기본값 설정
    });
    return newEvent.save();
  }

  async findAll(
    queryDto: EventQueryDto,
    // user: AuthenticatedUser, // 현재 사용자 정보 (로깅 또는 특정 필터링에 사용 가능)
  ): Promise<{ data: EventDocument[]; count: number }> {
    const {
      limit = 10,
      page = 1,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;
    const skip = (page - 1) * limit;

    const filters: FilterQuery<EventDocument> = {};
    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    // TODO: Add date range filters if needed (startDate, endDate from queryDto)

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder.toUpperCase() === 'ASC' ? 1 : -1;

    const data = await this.eventModel
      .find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    const count = await this.eventModel.countDocuments(filters).exec();

    return { data, count };
  }

  async findOne(
    eventId: string,
    // user: AuthenticatedUser, // 현재 사용자 정보 (필요시 접근 권한 확인에 사용)
  ): Promise<EventDocument> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }
    return event;
  }

  async update(
    eventId: string,
    updateEventDto: UpdateEventDto,
  ): Promise<EventDocument> {
    const existingEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        updateEventDto,
        { new: true }, // 업데이트된 문서를 반환
      )
      .exec();

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }
    return existingEvent;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(eventId: string, _user: AuthenticatedUser): Promise<void> {
    const result = await this.eventModel.deleteOne({ _id: eventId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }
  }
}
