import { Inject, Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApprovalStatus } from '../../../core/shared/enums/approval-status.enum';
import type { INewsApprovalRepository } from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { NEWS_APPROVAL_REPOSITORY } from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import type { INewsRepository } from '../../../core/domain/news/repositories/news.repository.interface';
import { NEWS_REPOSITORY } from '../../../core/domain/news/repositories/news.repository.interface';
import { NewsApprovalNotFoundException } from '../../../core/domain/news-approval/exceptions/news-approval-not-found.exception';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';
import { NewsApproval } from '../../../core/domain/news-approval/entities/news-approval.entity';

export interface ProcessNewsApprovalInput {
  approvalId: string;
  adminId: string;
  status: ApprovalStatus.approved | ApprovalStatus.rejected;
  comment?: string;
}

export interface ProcessNewsApprovalResult {
  approval: NewsApproval;
  editorId: string; // for WS emit
}

@Injectable()
export class ProcessNewsApprovalUseCase {
  constructor(
    @Inject(NEWS_APPROVAL_REPOSITORY)
    private readonly approvalRepository: INewsApprovalRepository,
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(input: ProcessNewsApprovalInput): Promise<ProcessNewsApprovalResult> {
    const approval = await this.approvalRepository.findById(input.approvalId);
    if (!approval) throw new NewsApprovalNotFoundException(input.approvalId);

    if (!approval.isAssignedTo(input.adminId)) {
      throw new ForbiddenException('This approval is not assigned to you');
    }

    if (approval.status !== ApprovalStatus.pending) {
      throw new BadRequestException('Approval has already been processed');
    }

    const news = await this.newsRepository.findById(approval.newsId);
    if (!news) throw new NewsNotFoundException(approval.newsId);

    approval.process(input.adminId, input.status, input.comment);

    if (input.status === ApprovalStatus.approved) {
      news.approve(); // → approved status
    } else {
      news.reject(); // → draft status
    }

    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository('NewsOrmEntity')
        .update(news.id, { status: news.status, updatedAt: news.updatedAt });
      await manager.getRepository('NewsApprovalOrmEntity').update(approval.id, {
        admin: { id: approval.adminId },
        status: approval.status,
        comment: approval.comment,
        reviewedAt: approval.reviewedAt,
      });
    });

    const saved = (await this.approvalRepository.findById(approval.id)) as NewsApproval;
    return { approval: saved, editorId: approval.editorId };
  }
}
