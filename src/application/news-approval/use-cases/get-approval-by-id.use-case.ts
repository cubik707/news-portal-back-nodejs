import { Inject, Injectable } from '@nestjs/common';
import { INewsApprovalRepository, NEWS_APPROVAL_REPOSITORY } from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { NewsApproval } from '../../../core/domain/news-approval/entities/news-approval.entity';
import { NewsApprovalNotFoundException } from '../../../core/domain/news-approval/exceptions/news-approval-not-found.exception';

@Injectable()
export class GetApprovalByIdUseCase {
  constructor(
    @Inject(NEWS_APPROVAL_REPOSITORY)
    private readonly approvalRepository: INewsApprovalRepository,
  ) {}

  async execute(id: string): Promise<NewsApproval> {
    const approval = await this.approvalRepository.findById(id);
    if (!approval) throw new NewsApprovalNotFoundException(id);
    return approval;
  }
}
