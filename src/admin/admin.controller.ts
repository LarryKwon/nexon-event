import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RewardRequestDocument } from '../schemas/reward-request.schema';
import { RewardRequestResponseDto } from '../reward/dto/reward-request-response.dto';
import { AdminService } from './admin.service';
import { RewardRequestQueryDto } from '../reward/dto/reward-request-query.dto';
import { ApiBearerAuth } from "@nestjs/swagger"; // 경로 수정

// Helper function to map RewardRequestDocument to RewardRequestResponseDto
// (RewardRequestController와 동일한 헬퍼 함수 사용 가능, 별도 유틸리티 파일로 분리 권장)
function mapRewardRequestToResponseDto(
  doc: RewardRequestDocument | any, // lean() 사용 시 any 또는 POJO 타입
): RewardRequestResponseDto {
  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : doc; // lean() 사용 시 doc 자체가 POJO
  return {
    _id: obj._id?.toString(),
    userId: obj.userId, // 문자열 ID
    eventId:
      obj.eventId?.toString() ||
      (typeof obj.eventId === 'object' ? obj.eventId.name : obj.eventId), // Populate된 경우 객체일 수 있음
    rewardId:
      obj.rewardId?.toString() ||
      (typeof obj.rewardId === 'object' ? obj.rewardId.name : obj.rewardId), // Populate된 경우 객체일 수 있음
    status: obj.status,
    failureReason: obj.failureReason,
    processedAt: obj.processedAt,
    claimedRewardDetails: obj.claimedRewardDetails,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

@ApiBearerAuth()
@Controller('/admin') // Event Server 내부 기본 경로 (Gateway에서 /api/admin/* 으로 라우팅 가정)
@UseGuards(JwtAuthGuard) // 컨트롤러 레벨에서 JWT 인증 기본 적용
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Gateway에서 /api/admin/reward-logs -> Event Server의 /admin/reward-requests 로 라우팅 가정
  @Get('/reward-requests')
  // Gateway에서 OPERATOR, AUDITOR, ADMIN 역할 검증 가정
  async findAllRewardRequests(
    @Query() query: RewardRequestQueryDto,
  ): Promise<{ data: RewardRequestResponseDto[]; count: number }> {
    // currentUser는 로깅이나, 서비스 내부에서 AUDITOR가 특정 필드를 못 보게 하는 등의 로직에 사용될 수 있습니다.
    // 예를 들어, 서비스 메서드에 currentUser를 전달하여 추가적인 권한 분기를 할 수 있습니다.
    const { data, count } =
      await this.adminService.findAllRewardRequestsAdmin(query);

    return {
      data: data.map(mapRewardRequestToResponseDto),
      count,
    };
  }
}
