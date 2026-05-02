import { NewsApproval } from '../../../core/domain/news-approval/entities/news-approval.entity';
import { ApprovalStatus } from '../../../core/shared/enums/approval-status.enum';

export class NewsApprovalResponseDto {
  id!: string;
  newsId!: string;
  editorId!: string;
  submittedToAdminId!: string | null;
  adminId!: string | null;
  status!: ApprovalStatus;
  comment!: string | null;
  seenByAdminAt!: Date | null;
  seenByEditorAt!: Date | null;
  reviewedAt!: Date | null;
  createdAt!: Date;

  static fromDomain(approval: NewsApproval): NewsApprovalResponseDto {
    const dto = new NewsApprovalResponseDto();
    dto.id = approval.id;
    dto.newsId = approval.newsId;
    dto.editorId = approval.editorId;
    dto.submittedToAdminId = approval.submittedToAdminId;
    dto.adminId = approval.adminId;
    dto.status = approval.status;
    dto.comment = approval.comment;
    dto.seenByAdminAt = approval.seenByAdminAt;
    dto.seenByEditorAt = approval.seenByEditorAt;
    dto.reviewedAt = approval.reviewedAt;
    dto.createdAt = approval.createdAt;
    return dto;
  }
}
