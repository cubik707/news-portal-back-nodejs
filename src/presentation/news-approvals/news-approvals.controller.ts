import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ProcessNewsApprovalUseCase } from '../../application/news-approval/use-cases/process-news-approval.use-case';
import { ProcessNewsApprovalDto } from '../../application/news-approval/dtos/process-news-approval.dto';
import { NewsApprovalResponseDto } from '../../application/news-approval/dtos/news-approval-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';

@Controller('news-approvals')
@UseGuards(ApprovedGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class NewsApprovalsController {
  constructor(private readonly processNewsApproval: ProcessNewsApprovalUseCase) {}

  @Post(':id/process')
  async process(
    @Param('id') id: string,
    @Body() dto: ProcessNewsApprovalDto,
  ): Promise<SuccessResponseDto<NewsApprovalResponseDto>> {
    const approval = await this.processNewsApproval.execute({
      approvalId: id,
      status: dto.status,
      comment: dto.comment,
    });
    return new SuccessResponseDto(
      NewsApprovalResponseDto.fromDomain(approval),
      'News approval processed',
    );
  }
}
