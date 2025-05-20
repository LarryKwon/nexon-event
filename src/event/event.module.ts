import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventSchema } from '../schemas/event.schema';
import { Reward, RewardSchema } from '../schemas/reward.schema';

// AuthModule 또는 CommonModule에서 JwtAuthGuard와 CurrentUser 데코레이터 관련 설정을 export하고
// 여기서 import 하거나, EventModule 자체적으로 PassportModule 등을 설정할 수도 있습니다.
// 여기서는 AuthGuard 등이 이미 전역적으로 또는 상위 모듈에서 처리 가능하다고 가정합니다.

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema }, // Reward 모델 등록
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService], // 다른 모듈에서 사용하려면 export
})
export class EventModule {}
