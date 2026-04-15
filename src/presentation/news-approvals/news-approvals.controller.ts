import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProcessNewsApprovalUseCase } from '../../application/news-approval/use-cases/process-news-approval.use-case';
import { GetPendingApprovalsUseCase } from '../../application/news-approval/use-cases/get-pending-approvals.use-case';
import { GetMyApprovalActivityUseCase } from '../../application/news-approval/use-cases/get-my-approval-activity.use-case';
import { GetApprovalBadgeCountUseCase } from '../../application/news-approval/use-cases/get-approval-badge-count.use-case';
import { MarkApprovalSeenUseCase } from '../../application/news-approval/use-cases/mark-approval-seen.use-case';
import { GetApprovalByIdUseCase } from '../../application/news-approval/use-cases/get-approval-by-id.use-case';
import { ProcessNewsApprovalDto } from '../../application/news-approval/dtos/process-news-approval.dto';
import { NewsApprovalResponseDto } from '../../application/news-approval/dtos/news-approval-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';
import type { JwtUserPayload } from '../auth/jwt.strategy';
import { ApprovalsGateway } from '../approvals-gateway/approvals.gateway';

@Controller('news-approvals')
@UseGuards(ApprovedGuard)
export class NewsApprovalsController {
  constructor(
    private readonly processApproval: ProcessNewsApprovalUseCase,
    private readonly getPendingApprovals: GetPendingApprovalsUseCase,
    private readonly getMyApprovalActivity: GetMyApprovalActivityUseCase,
    private readonly getBadgeCount: GetApprovalBadgeCountUseCase,
    private readonly markSeen: MarkApprovalSeenUseCase,
    private readonly getApprovalById: GetApprovalByIdUseCase,
    private readonly gateway: ApprovalsGateway,
  ) {}

  @Post(':id/process')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async process(
    @Param('id') id: string,
    @Body() dto: ProcessNewsApprovalDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsApprovalResponseDto>> {
    const { approval, editorId } = await this.processApproval.execute({
      approvalId: id,
      adminId: user.id,
      status: dto.status,
      comment: dto.comment,
    });
    this.gateway.emitApprovalDecided(editorId, {
      approvalId: approval.id,
      newsId: approval.newsId,
      status: approval.status,
      comment: approval.comment,
    });
    return new SuccessResponseDto(
      NewsApprovalResponseDto.fromDomain(approval),
      'Approval processed',
    );
  }

  // Static routes BEFORE parameterized :id routes
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPending(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsApprovalResponseDto[]>> {
    const approvals = await this.getPendingApprovals.execute(user.id);
    return new SuccessResponseDto(
      approvals.map(NewsApprovalResponseDto.fromDomain),
      'Pending approvals',
    );
  }

  @Get('my-activity')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EDITOR)
  async getMyActivity(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsApprovalResponseDto[]>> {
    const approvals = await this.getMyApprovalActivity.execute(user.id);
    return new SuccessResponseDto(
      approvals.map(NewsApprovalResponseDto.fromDomain),
      'Activity retrieved',
    );
  }

  @Get('badge')
  async getBadge(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<{ count: number }>> {
    const count = await this.getBadgeCount.execute(user.id, user.roles);
    return new SuccessResponseDto({ count }, 'Badge count');
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<SuccessResponseDto<NewsApprovalResponseDto>> {
    const approval = await this.getApprovalById.execute(id);
    return new SuccessResponseDto(
      NewsApprovalResponseDto.fromDomain(approval),
      'Approval retrieved',
    );
  }

  @Patch(':id/seen')
  async markAsSeen(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<null>> {
    await this.markSeen.execute(id, user.id, user.roles);
    return new SuccessResponseDto(null, 'Marked as seen');
  }
}
