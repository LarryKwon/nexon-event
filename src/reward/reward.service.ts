import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Types 추가
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward, RewardDocument } from '../schemas/reward.schema';
import { EventDocument } from '../schemas/event.schema'; // 경로 확인

@Injectable()
export class RewardService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>, // Event 모델 주입
  ) {}

  private async findEventOrFail(eventId: string): Promise<EventDocument> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }
    return event;
  }

  async addRewardToEvent(
    eventId: string,
    createRewardDto: CreateRewardDto,
  ): Promise<RewardDocument> {
    await this.findEventOrFail(eventId);
    const newReward = new this.rewardModel({
      ...createRewardDto,
      eventId: new Types.ObjectId(eventId), // eventId를 ObjectId로 변환하여 저장
      claimedCount: 0, // 초기 지급 수량
    });
    return newReward.save();
  }

  async findRewardsForEvent(
    eventId: string,
    // user: AuthenticatedUser, // 현재 사용자 정보
  ): Promise<RewardDocument[]> {
    await this.findEventOrFail(eventId); // 이벤트 존재 여부 확인
    return this.rewardModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .exec();
  }

  async findOneRewardInEvent(
    eventId: string,
    rewardId: string,
  ): Promise<RewardDocument> {
    await this.findEventOrFail(eventId);
    const reward = await this.rewardModel
      .findOne({
        _id: new Types.ObjectId(rewardId),
        eventId: new Types.ObjectId(eventId),
      })
      .exec();

    if (!reward) {
      throw new NotFoundException(
        `Reward with ID "<span class="math-inline">\{rewardId\}" not found for event "</span>{eventId}"`,
      );
    }
    return reward;
  }

  async updateRewardInEvent(
    eventId: string,
    rewardId: string,
    updateRewardDto: UpdateRewardDto,
  ): Promise<RewardDocument> {
    await this.findEventOrFail(eventId); // 이벤트 존재 여부 확인

    // Gateway에서 OPERATOR, ADMIN 역할 검증 가정
    // if (!user.roles.includes(Role.OPERATOR) && !user.roles.includes(Role.ADMIN)) {
    //   throw new ForbiddenException('You do not have permission to update rewards for this event.');
    // }

    const updatedReward = await this.rewardModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(rewardId),
          eventId: new Types.ObjectId(eventId),
        },
        updateRewardDto,
        { new: true },
      )
      .exec();

    if (!updatedReward) {
      throw new NotFoundException(
        `Reward with ID "<span class="math-inline">\{rewardId\}" not found for event "</span>{eventId}" to update`,
      );
    }
    return updatedReward;
  }

  async removeRewardFromEvent(
    eventId: string,
    rewardId: string,
  ): Promise<void> {
    await this.findEventOrFail(eventId); // 이벤트 존재 여부 확인

    // Gateway에서 ADMIN 역할 검증 가정
    // if (!user.roles.includes(Role.ADMIN)) {
    //   throw new ForbiddenException('You do not have permission to delete rewards from this event.');
    // }

    const result = await this.rewardModel
      .deleteOne({
        _id: new Types.ObjectId(rewardId),
        eventId: new Types.ObjectId(eventId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Reward with ID "<span class="math-inline">\{rewardId\}" not found for event "</span>{eventId}" to delete`,
      );
    }
    // 관련된 RewardRequest 처리 로직이 필요할 수 있음
  }
}
