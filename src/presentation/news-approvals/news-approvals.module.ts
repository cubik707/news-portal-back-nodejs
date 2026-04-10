import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { NewsApprovalsController } from './news-approvals.controller';
import { ProcessNewsApprovalUseCase } from '../../application/news-approval/use-cases/process-news-approval.use-case';
import { GetPendingApprovalsUseCase } from '../../application/news-approval/use-cases/get-pending-approvals.use-case';
import { GetMyApprovalActivityUseCase } from '../../application/news-approval/use-cases/get-my-approval-activity.use-case';
import { GetApprovalBadgeCountUseCase } from '../../application/news-approval/use-cases/get-approval-badge-count.use-case';
import { MarkApprovalSeenUseCase } from '../../application/news-approval/use-cases/mark-approval-seen.use-case';
import { GetApprovalByIdUseCase } from '../../application/news-approval/use-cases/get-approval-by-id.use-case';
import { ApprovalsGatewayModule } from '../approvals-gateway/approvals-gateway.module';

@Module({
  imports: [DatabaseModule, ApprovalsGatewayModule],
  controllers: [NewsApprovalsController],
  providers: [
    ProcessNewsApprovalUseCase,
    GetPendingApprovalsUseCase,
    GetMyApprovalActivityUseCase,
    GetApprovalBadgeCountUseCase,
    MarkApprovalSeenUseCase,
    GetApprovalByIdUseCase,
  ],
})
export class NewsApprovalsModule {}
