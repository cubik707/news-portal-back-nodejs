import { Inject, Injectable } from '@nestjs/common';
import { INewsApprovalRepository, NEWS_APPROVAL_REPOSITORY } from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { NewsApproval } from '../../../core/domain/news-approval/entities/news-approval.entity';

@Injectable()
export class GetMyApprovalActivityUseCase {
  constructor(
    @Inject(NEWS_APPROVAL_REPOSITORY)
    private readonly approvalRepository: INewsApprovalRepository,
  ) {}

  async execute(editorId: string): Promise<NewsApproval[]> {
    return this.approvalRepository.findByEditorId(editorId);
  }
}
