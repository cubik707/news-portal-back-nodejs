import { Inject, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NewsApproval } from '../../../core/domain/news-approval/entities/news-approval.entity';
import type { INewsApprovalRepository } from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { NEWS_APPROVAL_REPOSITORY } from '../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import type { INewsRepository } from '../../../core/domain/news/repositories/news.repository.interface';
import { NEWS_REPOSITORY } from '../../../core/domain/news/repositories/news.repository.interface';
import type { IUserRepository } from '../../../core/domain/user/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../core/domain/user/repositories/user.repository.interface';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';
import { UserRole } from '../../../core/shared/enums/user-role.enum';

export interface SubmitNewsForApprovalInput {
  newsId: string;
  editorId: string;
  adminId?: string; // null = broadcast to all admins
}

export interface SubmitNewsForApprovalResult {
  approval: NewsApproval;
  targetAdminIds: string[]; // for WS emit
}

@Injectable()
export class SubmitNewsForApprovalUseCase {
  constructor(
    @Inject(NEWS_APPROVAL_REPOSITORY)
    private readonly approvalRepository: INewsApprovalRepository,
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(input: SubmitNewsForApprovalInput): Promise<SubmitNewsForApprovalResult> {
    const news = await this.newsRepository.findById(input.newsId);
    if (!news) throw new NewsNotFoundException(input.newsId);

    if (news.author.id !== input.editorId) {
      throw new ForbiddenException('You can only submit your own articles');
    }

    const existing = await this.approvalRepository.findActiveForNews(input.newsId);
    if (existing) {
      throw new BadRequestException('This article already has a pending review');
    }

    const approval = NewsApproval.create({
      newsId: input.newsId,
      editorId: input.editorId,
      submittedToAdminId: input.adminId ?? null,
    });

    await this.dataSource.transaction(async (manager) => {
      news.submitForReview();
      await manager.getRepository('NewsOrmEntity').update(news.id, { status: news.status });

      const entity = manager.getRepository('NewsApprovalOrmEntity').create({
        id: approval.id,
        news: { id: approval.newsId },
        editor: { id: approval.editorId },
        submittedToAdmin: approval.submittedToAdminId ? { id: approval.submittedToAdminId } : null,
        status: approval.status,
      });
      await manager.getRepository('NewsApprovalOrmEntity').save(entity);
    });

    const savedApproval = await this.approvalRepository.findById(approval.id) as NewsApproval;

    // Determine which admins to notify
    let targetAdminIds: string[];
    if (input.adminId) {
      targetAdminIds = [input.adminId];
    } else {
      const admins = await this.userRepository.findAllByRole(UserRole.ADMIN);
      targetAdminIds = admins.map((a) => a.id);
    }

    return { approval: savedApproval, targetAdminIds };
  }
}
