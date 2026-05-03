import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { CreateAmendmentUseCase } from '../../application/amendment/use-cases/create-amendment.use-case';
import { GetAmendmentsUseCase } from '../../application/amendment/use-cases/get-amendments.use-case';
import { GetMyUnseenAmendmentUseCase } from '../../application/amendment/use-cases/get-my-unseen-amendment.use-case';
import { ApproveAmendmentUseCase } from '../../application/amendment/use-cases/approve-amendment.use-case';
import { RejectAmendmentUseCase } from '../../application/amendment/use-cases/reject-amendment.use-case';
import { MarkAmendmentSeenUseCase } from '../../application/amendment/use-cases/mark-amendment-seen.use-case';
import { GetPendingAmendmentsCountUseCase } from '../../application/amendment/use-cases/get-pending-amendments-count.use-case';
import { AmendmentCreateDto } from '../../application/amendment/dtos/amendment-create.dto';
import { AmendmentRejectDto } from '../../application/amendment/dtos/amendment-reject.dto';
import { AmendmentResponseDto } from '../../application/amendment/dtos/amendment-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';
import type { JwtUserPayload } from '../auth/jwt.strategy';

@Controller('amendments')
@UseGuards(ApprovedGuard)
export class AmendmentsController {
  constructor(
    private readonly createAmendment: CreateAmendmentUseCase,
    private readonly getAmendments: GetAmendmentsUseCase,
    private readonly getMyUnseenAmendment: GetMyUnseenAmendmentUseCase,
    private readonly approveAmendment: ApproveAmendmentUseCase,
    private readonly rejectAmendment: RejectAmendmentUseCase,
    private readonly markAmendmentSeen: MarkAmendmentSeenUseCase,
    private readonly getPendingAmendmentsCount: GetPendingAmendmentsCountUseCase,
  ) {}

  // ── Static routes first ────────────────────────────────────────────────────

  @Get('pending/count')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingCount(): Promise<SuccessResponseDto<{ count: number }>> {
    const count = await this.getPendingAmendmentsCount.execute();
    return new SuccessResponseDto({ count }, 'Pending amendments count');
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body() dto: AmendmentCreateDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<AmendmentResponseDto>> {
    const amendment = await this.createAmendment.execute({
      userId: user.id,
      comment: dto.comment,
    });
    return new SuccessResponseDto(AmendmentResponseDto.fromDomain(amendment), 'Amendment created', 201);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<SuccessResponseDto<AmendmentResponseDto[]>> {
    const amendments = await this.getAmendments.execute();
    return new SuccessResponseDto(amendments.map(AmendmentResponseDto.fromDomain), 'Amendments retrieved');
  }

  @Get('my/unseen')
  async getMyUnseen(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<AmendmentResponseDto | null>> {
    const amendment = await this.getMyUnseenAmendment.execute(user.id);
    return new SuccessResponseDto(
      amendment ? AmendmentResponseDto.fromDomain(amendment) : null,
      'Unseen amendment retrieved',
    );
  }

  // ── Parameterized routes after ─────────────────────────────────────────────

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<AmendmentResponseDto>> {
    const amendment = await this.approveAmendment.execute({ amendmentId: id, reviewedBy: user.id });
    return new SuccessResponseDto(AmendmentResponseDto.fromDomain(amendment), 'Amendment approved');
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async reject(
    @Param('id') id: string,
    @Body() dto: AmendmentRejectDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<AmendmentResponseDto>> {
    const amendment = await this.rejectAmendment.execute({
      amendmentId: id,
      reviewedBy: user.id,
      rejectionReason: dto.rejectionReason,
    });
    return new SuccessResponseDto(AmendmentResponseDto.fromDomain(amendment), 'Amendment rejected');
  }

  @Post(':id/seen')
  async markSeen(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<null>> {
    await this.markAmendmentSeen.execute({ amendmentId: id, userId: user.id });
    return new SuccessResponseDto(null, 'Amendment marked as seen');
  }
}
