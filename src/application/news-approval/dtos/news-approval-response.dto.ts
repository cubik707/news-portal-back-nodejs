import { NewsApproval } from '../../../core/domain/news-approval/entities/news-approval.entity';
import { ApprovalStatus } from '../../../core/shared/enums/approval-status.enum';

export class NewsApprovalResponseDto {
  id!: string;
  newsId!: string;
  editorId!: string;
  status!: ApprovalStatus;
  comment!: string | null;
  reviewedAt!: Date;

  static fromDomain(approval: NewsApproval): NewsApprovalResponseDto {
    const dto = new NewsApprovalResponseDto();
    dto.id = approval.id;
    dto.newsId = approval.newsId;
    dto.editorId = approval.editorId;
    dto.status = approval.status;
    dto.comment = approval.comment;
    dto.reviewedAt = approval.reviewedAt;
    return dto;
  }
}
