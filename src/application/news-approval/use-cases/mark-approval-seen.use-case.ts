import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { INewsApprovalRepository, NEWS_APPROVAL_REPOSITORY } from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { NewsApprovalNotFoundException } from '../../../core/domain/news-approval/exceptions/news-approval-not-found.exception';
import { UserRole } from '../../../core/shared/enums/user-role.enum';

@Injectable()
export class MarkApprovalSeenUseCase {
  constructor(
    @Inject(NEWS_APPROVAL_REPOSITORY)
    private readonly approvalRepository: INewsApprovalRepository,
  ) {}

  async execute(approvalId: string, userId: string, roles: UserRole[]): Promise<void> {
    const approval = await this.approvalRepository.findById(approvalId);
    if (!approval) throw new NewsApprovalNotFoundException(approvalId);

    if (roles.includes(UserRole.ADMIN)) {
      if (!approval.isAssignedTo(userId)) throw new ForbiddenException();
      approval.markSeenByAdmin();
    } else {
      if (approval.editorId !== userId) throw new ForbiddenException();
      approval.markSeenByEditor();
    }

    await this.approvalRepository.save(approval);
  }
}
