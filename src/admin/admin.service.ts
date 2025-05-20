import { RewardRequestQueryDto } from '../reward/dto/reward-request-query.dto';
import {
  RewardRequest,
  RewardRequestDocument,
} from '../schemas/reward-request.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export class AdminService {
  constructor(
    @InjectModel(RewardRequest.name)
    private rewardRequestModel: Model<RewardRequestDocument>,
  ) {}
  async findAllRewardRequestsAdmin(
    queryDto: RewardRequestQueryDto,
    // currentUser: AuthenticatedUser, // 요청자 정보 (로깅 또는 내부 권한 분기 시 사용)
  ): Promise<{ data: RewardRequestDocument[]; count: number }> {
    const {
      limit = 10,
      page = 1,
      userId, // 관리자가 특정 사용자를 필터링할 수 있도록 DTO에 userId 필드 사용
      eventId,
      rewardId,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;
    const skip = (page - 1) * limit;

    const filters: FilterQuery<RewardRequestDocument> = {};

    if (userId) {
      filters.userId = userId; // DTO에 있는 userId로 필터링
    }
    if (eventId) {
      filters.eventId = new Types.ObjectId(eventId);
    }
    if (rewardId) {
      filters.rewardId = new Types.ObjectId(rewardId);
    }
    if (status) {
      filters.status = status;
    }
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder.toUpperCase() === 'ASC' ? 1 : -1;

    const data = await this.rewardRequestModel
      .find(filters)
      .populate('eventId', 'name') // 이벤트 이름 populate
      .populate('rewardId', 'name type') // 보상 이름, 타입 populate
      .populate('userId', 'username') // Auth Server와 연동이 안되어 있으므로, 여기서는 userId(string)만 표시.
      // 만약 사용자 정보를 보여줘야 한다면, Gateway나 API Composition 패턴을 통해 Auth Server에서 가져와야 함.
      // 지금은 userId 필드가 String이므로 populate('userId', 'username')은 동작하지 않음.
      // 만약 User 스키마가 Event 서버에도 있고, userId를 ObjectId로 저장한다면 가능.
      // 현재 설계에서는 userId는 문자열이므로, populate('userId', ...)는 주석 처리하거나 제거.
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean() // 성능을 위해 lean() 사용 가능 (Mongoose Document 대신 POJO 반환)
      .exec();

    const count = await this.rewardRequestModel.countDocuments(filters).exec();

    // currentUser.roles를 참고하여 AUDITOR는 특정 필드만 보여주거나 하는 등의
    // 추가적인 데이터 가공/필터링 로직을 여기에 넣을 수 있습니다.
    // (예: if (currentUser.roles.includes(Role.AUDITOR)) { /* 데이터 필터링 */ })
    // 현재는 모든 허용된 역할이 동일한 데이터를 본다고 가정합니다.

    return { data: data as RewardRequestDocument[], count }; // lean() 사용 시 타입 단언 필요할 수 있음
  }
}
