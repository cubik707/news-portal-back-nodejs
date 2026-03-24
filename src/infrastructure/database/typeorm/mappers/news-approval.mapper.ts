import { NewsApproval } from '../../../../core/domain/news-approval/entities/news-approval.entity';
import { NewsApprovalOrmEntity } from '../entities/news-approval.orm-entity';

export class NewsApprovalMapper {
  static toDomain(orm: NewsApprovalOrmEntity): NewsApproval {
    return NewsApproval.reconstitute({
      id: orm.id,
      newsId: orm.news.id,
      editorId: orm.editor.id,
      status: orm.status,
      comment: orm.comment ?? null,
      reviewedAt: orm.reviewedAt,
    });
  }
}
