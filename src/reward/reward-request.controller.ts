import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator'; // 경로 확인
import { RewardRequestResponseDto } from './dto/reward-request-response.dto';
import { RewardRequestQueryDto } from './dto/reward-request-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // 경로 확인
import { RewardRequestService } from './reward-request.service';
import { RewardRequestDocument } from '../schemas/reward-request.schema';
import { ApiBearerAuth } from '@nestjs/swagger';

function mapRewardRequestToResponseDto(
  doc: RewardRequestDocument,
): RewardRequestResponseDto {
  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
  return {
    _id: obj._id?.toString(),
    userId: obj.userId,
    eventId: obj.eventId?.toString(), // ObjectId를 문자열로
    rewardId: obj.rewardId?.toString(), // ObjectId를 문자열로
    status: obj.status,
    failureReason: obj.failureReason,
    processedAt: obj.processedAt,
    claimedRewardDetails: obj.claimedRewardDetails, // 이미 객체 형태일 것으로 예상
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

@ApiBearerAuth()
@Controller('rewards/reward-requests') // 컨트롤러 기본 경로 변경
@UseGuards(JwtAuthGuard) // 컨트롤러 레벨에서 JWT 인증 기본 적용
export class RewardRequestController {
  constructor(private readonly rewardRequestService: RewardRequestService) {}

  @Post() // POST /reward-requests
  @HttpCode(HttpStatus.CREATED)
  // Gateway에서 USER 역할 검증 가정
  async requestReward(
    @Body() createRewardRequestDto: CreateRewardRequestDto, // DTO에서 eventId, rewardId 유효성 검사
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RewardRequestResponseDto> {
    const rewardRequest = await this.rewardRequestService.requestReward(
      user,
      createRewardRequestDto,
    );
    return mapRewardRequestToResponseDto(rewardRequest);
  }

  @Get('/me') // GET /reward-requests/me
  // Gateway에서 USER 역할 검증 가정
  async findMyRewardRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RewardRequestQueryDto,
  ): Promise<{ data: RewardRequestResponseDto[]; count: number }> {
    const { data, count } =
      await this.rewardRequestService.findUserRewardRequests(user._id, query);
    return {
      data: data.map(mapRewardRequestToResponseDto),
      count,
    };
  }
}
