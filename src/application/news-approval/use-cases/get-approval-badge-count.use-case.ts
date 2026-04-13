import { Inject, Injectable } from '@nestjs/common';
import type { INewsApprovalRepository } from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { NEWS_APPROVAL_REPOSITORY } from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { UserRole } from '../../../core/shared/enums/user-role.enum';

@Injectable()
export class GetApprovalBadgeCountUseCase {
  constructor(
    @Inject(NEWS_APPROVAL_REPOSITORY)
    private readonly approvalRepository: INewsApprovalRepository,
  ) {}

  async execute(userId: string, roles: UserRole[]): Promise<number> {
    if (roles.includes(UserRole.ADMIN)) {
      return this.approvalRepository.countUnseenForAdmin(userId);
    }
    return this.approvalRepository.countUnseenForEditor(userId);
  }
}
