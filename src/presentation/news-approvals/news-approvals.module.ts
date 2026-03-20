import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { NewsApprovalsController } from './news-approvals.controller';
import { ProcessNewsApprovalUseCase } from '../../application/news-approval/use-cases/process-news-approval.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [NewsApprovalsController],
  providers: [ProcessNewsApprovalUseCase],
})
export class NewsApprovalsModule {}
