import { NewsApproval } from '../../../../core/domain/news-approval/entities/news-approval.entity';
import { NewsApprovalOrmEntity } from '../entities/news-approval.orm-entity';

export class NewsApprovalMapper {
  static toDomain(orm: NewsApprovalOrmEntity): NewsApproval {
    return NewsApproval.reconstitute({
      id: orm.id,
      newsId: orm.news.id,
      editorId: orm.editor.id,
      submittedToAdminId: orm.submittedToAdmin?.id ?? null,
      adminId: orm.admin?.id ?? null,
      status: orm.status,
      comment: orm.comment ?? null,
      seenByAdminAt: orm.seenByAdminAt ?? null,
      seenByEditorAt: orm.seenByEditorAt ?? null,
      reviewedAt: orm.reviewedAt ?? null,
      createdAt: orm.createdAt,
    });
  }
}
