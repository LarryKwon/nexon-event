import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateRewardDto } from './dto/create-reward.dto';
import { RewardResponseDto } from './dto/reward-response.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // 경로 확인
import { RewardService } from './reward.service';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { RewardDocument } from '../schemas/reward.schema';
import { ApiBearerAuth } from '@nestjs/swagger'; // 경로 확인

function mapRewardToResponseDto(reward: RewardDocument): RewardResponseDto {
  const rewardObject = reward.toObject
    ? reward.toObject({ virtuals: true })
    : reward;
  return {
    _id: rewardObject._id?.toString(),
    eventId: rewardObject.eventId?.toString(), // ObjectId를 문자열로
    name: rewardObject.name,
    description: rewardObject.description,
    type: rewardObject.type,
    details: rewardObject.details,
    quantity: rewardObject.quantity,
    claimedCount: rewardObject.claimedCount,
    createdAt: rewardObject.createdAt,
    updatedAt: rewardObject.updatedAt,
  };
}

@ApiBearerAuth()
@Controller('events/:eventId/rewards') // 기본 경로 설정
@UseGuards(JwtAuthGuard) // 컨트롤러 레벨에서 JWT 인증 기본 적용
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // Gateway에서 OPERATOR, ADMIN 역할 검증 가정
  async addReward(
    @Param('eventId', ParseObjectIdPipe) eventId: string,
    @Body() createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    const reward = await this.rewardService.addRewardToEvent(
      eventId,
      createRewardDto,
    );
    return mapRewardToResponseDto(reward);
  }

  @Get()
  // Gateway에서 모든 인증된 사용자 접근 가능 가정
  async findRewardsForEvent(
    @Param('eventId', ParseObjectIdPipe) eventId: string,
    // @CurrentUser() user: AuthenticatedUser, // 서비스에서 user가 필요 없다면 생략 가능
  ): Promise<RewardResponseDto[]> {
    const rewards = await this.rewardService.findRewardsForEvent(eventId);
    return rewards.map(mapRewardToResponseDto);
  }

  @Get(':rewardId')
  // Gateway에서 모든 인증된 사용자 접근 가능 가정
  async findOneReward(
    @Param('eventId', ParseObjectIdPipe) eventId: string,
    @Param('rewardId', ParseObjectIdPipe) rewardId: string,
  ): Promise<RewardResponseDto> {
    const reward = await this.rewardService.findOneRewardInEvent(
      eventId,
      rewardId,
    );
    return mapRewardToResponseDto(reward);
  }

  @Put(':rewardId')
  // Gateway에서 OPERATOR, ADMIN 역할 검증 가정
  async updateReward(
    @Param('eventId', ParseObjectIdPipe) eventId: string,
    @Param('rewardId', ParseObjectIdPipe) rewardId: string,
    @Body() updateRewardDto: UpdateRewardDto,
  ): Promise<RewardResponseDto> {
    const reward = await this.rewardService.updateRewardInEvent(
      eventId,
      rewardId,
      updateRewardDto,
    );
    return mapRewardToResponseDto(reward);
  }

  @Delete(':rewardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  // Gateway에서 ADMIN 역할 검증 가정
  async removeReward(
    @Param('eventId', ParseObjectIdPipe) eventId: string,
    @Param('rewardId', ParseObjectIdPipe) rewardId: string,
  ): Promise<void> {
    await this.rewardService.removeRewardFromEvent(eventId, rewardId);
  }
}
