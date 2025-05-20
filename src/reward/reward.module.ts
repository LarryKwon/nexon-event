import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { RewardRequestController } from './reward-request.controller'; // 추가
import { RewardRequestService } from './reward-request.service';
import { Reward, RewardSchema } from '../schemas/reward.schema';
import {
  RewardRequest,
  RewardRequestSchema,
} from '../schemas/reward-request.schema';
import { EventSchema } from '../schemas/event.schema'; // 추가

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: RewardRequest.name, schema: RewardRequestSchema }, // RewardRequest 모델 등록
    ]),
  ],
  controllers: [
    RewardController,
    RewardRequestController, // RewardRequestController 등록
  ],
  providers: [
    RewardService,
    RewardRequestService, // RewardRequestService 등록
  ],
  exports: [RewardService, RewardRequestService],
})
export class RewardModule {}
