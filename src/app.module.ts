import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RewardModule } from './reward/reward.module';
import { EventModule } from './event/event.module';
import { MongooseModule } from '@nestjs/mongoose';
import settings from './settings';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    RewardModule,
    EventModule,
    MongooseModule.forRoot(settings().dbConfig().url),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
