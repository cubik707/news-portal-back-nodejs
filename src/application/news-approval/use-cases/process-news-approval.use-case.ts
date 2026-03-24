import { Inject, Injectable } from '@nestjs/common';
import { ApprovalStatus } from '../../../core/shared/enums/approval-status.enum';
import {
  type INewsApprovalRepository,
  NEWS_APPROVAL_REPOSITORY,
} from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import { NewsApprovalNotFoundException } from '../../../core/domain/news-approval/exceptions/news-approval-not-found.exception';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';
import { NewsApproval } from '../../../core/domain/news-approval/entities/news-approval.entity';

export interface ProcessNewsApprovalInput {
  approvalId: string;
  status: ApprovalStatus.approved | ApprovalStatus.rejected;
  comment?: string;
}

@Injectable()
export class ProcessNewsApprovalUseCase {
  constructor(
    @Inject(NEWS_APPROVAL_REPOSITORY)
    private readonly approvalRepository: INewsApprovalRepository,
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
  ) {}

  async execute(input: ProcessNewsApprovalInput): Promise<NewsApproval> {
    const approval = await this.approvalRepository.findById(input.approvalId);
    if (!approval) {
      throw new NewsApprovalNotFoundException(input.approvalId);
    }

    const news = await this.newsRepository.findById(approval.newsId);
    if (!news) {
      throw new NewsNotFoundException(approval.newsId);
    }

    if (input.status === ApprovalStatus.approved) {
      news.approve();
    } else {
      news.reject();
    }

    await this.newsRepository.update(news.id, news);

    approval.process(input.status, input.comment);
    return this.approvalRepository.save(approval);
  }
}
