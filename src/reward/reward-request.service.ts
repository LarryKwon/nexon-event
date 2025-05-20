import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { RewardRequestQueryDto } from './dto/reward-request-query.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import {
  RewardRequest,
  RewardRequestDocument,
  RewardRequestStatus,
} from '../schemas/reward-request.schema';
import { EventDocument, EventStatus } from '../schemas/event.schema';
import { Reward, RewardDocument } from '../schemas/reward.schema'; // 경로 확인
// Role Enum은 여기서 직접적인 역할 분기에는 사용하지 않지만, AuthenticatedUser 타입에 포함될 수 있습니다.

@Injectable()
export class RewardRequestService {
  constructor(
    @InjectModel(RewardRequest.name)
    private rewardRequestModel: Model<RewardRequestDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
  ) {}

  async requestReward(
    user: AuthenticatedUser,
    createDto: CreateRewardRequestDto,
  ): Promise<RewardRequestDocument> {
    const { eventId, rewardId } = createDto;
    const userId = user._id;

    // 1. 이벤트 및 보상 존재 여부, 보상이 이벤트에 속하는지 확인
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found.`);
    }

    const reward = await this.rewardModel
      .findOne({ _id: rewardId, eventId: event._id })
      .exec();
    if (!reward) {
      throw new NotFoundException(
        `Reward with ID "${rewardId}" not found for event "${eventId}".`,
      );
    }

    // 2. 이벤트 상태 및 기간 확인
    console.log(event);
    if (
      event.status !== EventStatus.ACTIVE ||
      new Date() < event.startDate ||
      new Date() > event.endDate
    ) {
      const requestLog = new this.rewardRequestModel({
        userId,
        eventId,
        rewardId,
        status: RewardRequestStatus.FAILED_EVENT_INACTIVE,
      });
      await requestLog.save();
      throw new ForbiddenException(
        'Event is not active or outside its valid period.',
      );
    }

    // 3. 중복 보상 요청 확인 (성공한 요청 기준)
    const existingSuccessfulRequest = await this.rewardRequestModel
      .findOne({
        userId,
        eventId,
        rewardId,
        status: RewardRequestStatus.SUCCESS,
      })
      .exec();

    if (existingSuccessfulRequest) {
      const requestLog = new this.rewardRequestModel({
        // 실패 로그도 남길 수 있음
        userId,
        eventId,
        rewardId,
        status: RewardRequestStatus.FAILED_ALREADY_CLAIMED,
      });
      await requestLog.save();
      throw new ConflictException('Reward already claimed for this event.');
    }

    // 4. 보상 재고 확인
    if (reward.quantity > 0 && reward.claimedCount >= reward.quantity) {
      // quantity가 0이면 무제한으로 간주
      const requestLog = new this.rewardRequestModel({
        userId,
        eventId,
        rewardId,
        status: RewardRequestStatus.FAILED_OUT_OF_STOCK,
      });
      await requestLog.save();
      throw new ForbiddenException('Reward is out of stock.');
    }

    // 5. 이벤트 조건 충족 여부 검증 (★ 중요: 이 부분은 실제 조건에 따라 매우 복잡해질 수 있습니다)
    // 과제에서는 "자유롭게 조건 로직을 정해도 된다"고 했으므로, 여기서는 단순화하거나 외부 서비스 호출을 가정합니다.
    // 예시: 이벤트 조건이 'MANUAL'이 아니고, 특정 조건을 만족해야 하는 경우
    const conditionsMet = await this.checkEventConditions(user, event); // 가상의 조건 검증 함수
    if (!conditionsMet) {
      const requestLog = new this.rewardRequestModel({
        userId,
        eventId,
        rewardId,
        status: RewardRequestStatus.FAILED_CONDITION_NOT_MET,
      });
      await requestLog.save();
      throw new ForbiddenException('Event conditions not met.');
    }

    try {
      // 보상 지급 수량 증가
      reward.claimedCount += 1;
      console.log(reward);
      await reward.save();

      // 보상 요청 기록 생성
      const rewardRequest = new this.rewardRequestModel({
        userId,
        eventId,
        rewardId,
        status: RewardRequestStatus.SUCCESS,
        processedAt: new Date(),
        claimedRewardDetails: {
          // 지급된 보상 정보 스냅샷 (선택적)
          rewardId: reward._id.toString(),
          name: reward.name,
          type: reward.type,
          details: reward.details,
        },
      });
      await rewardRequest.save();

      return rewardRequest;
    } catch (error) {
      const requestLog = new this.rewardRequestModel({
        userId,
        eventId,
        rewardId,
        status: RewardRequestStatus.FAILED_ERROR,
        failureReason: error.message,
      });
      await requestLog.save(); // 세션 없이 저장 (실패 로깅)
      throw new BadRequestException(
        'Failed to process reward request due to an error.',
      );
    }
  }

  // 가상의 이벤트 조건 검증 함수 (실제 구현 필요)
  private async checkEventConditions(
    user: AuthenticatedUser,
    event: EventDocument,
  ): Promise<boolean> {
    // TODO: Implement actual condition checking logic based on event.conditions
    // 예: event.conditions.type === EventConditionType.LOGIN_STREAK
    // 이 경우, 사용자의 로그인 기록을 다른 서비스에서 조회하여 확인해야 할 수 있습니다.
    // 여기서는 간단히 true를 반환하거나, event.conditions가 없으면 true로 간주합니다.
    if (!event.conditions || !event.conditions.type) return true; // 조건이 없으면 통과로 간주 (예시)

    console.log(
      `Checking conditions for user ${user._id} and event ${event._id}: ${JSON.stringify(event.conditions)}`,
    );
    // 이 부분은 실제 서비스에서는 매우 복잡한 로직이 될 수 있습니다.
    // (예: 외부 API 호출, 다른 DB 조회 등)
    // 현재는 항상 true를 반환하여 조건 검증을 통과시킵니다.
    return true;
  }

  async findUserRewardRequests(
    userId: string,
    queryDto: RewardRequestQueryDto,
  ): Promise<{ data: RewardRequestDocument[]; count: number }> {
    const {
      limit = 10,
      page = 1,
      eventId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
    } = queryDto;
    const skip = (page - 1) * limit;

    const filters: FilterQuery<RewardRequestDocument> = { userId }; // 항상 자신의 요청만 조회

    if (eventId) {
      filters.eventId = new Types.ObjectId(eventId);
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
      .populate('eventId', 'name') // 이벤트 이름 정도는 populate 해서 보여줄 수 있음
      .populate('rewardId', 'name type') // 보상 이름, 타입 정도 populate
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    const count = await this.rewardRequestModel.countDocuments(filters).exec();

    return { data, count };
  }
}
