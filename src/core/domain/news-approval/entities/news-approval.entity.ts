import { uuidv7 } from 'uuidv7';
import { ApprovalStatus } from '../../../shared/enums/approval-status.enum';

export interface NewsApprovalProps {
  id: string;
  newsId: string;
  editorId: string;
  submittedToAdminId: string | null;
  adminId: string | null;
  status: ApprovalStatus;
  comment: string | null;
  seenByAdminAt: Date | null;
  seenByEditorAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

export class NewsApproval {
  private constructor(private readonly props: NewsApprovalProps) {}

  static create(props: {
    newsId: string;
    editorId: string;
    submittedToAdminId: string | null;
  }): NewsApproval {
    return new NewsApproval({
      id: uuidv7(),
      newsId: props.newsId,
      editorId: props.editorId,
      submittedToAdminId: props.submittedToAdminId,
      adminId: null,
      status: ApprovalStatus.pending,
      comment: null,
      seenByAdminAt: null,
      seenByEditorAt: null,
      reviewedAt: null,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: NewsApprovalProps): NewsApproval {
    return new NewsApproval(props);
  }

  get id(): string { return this.props.id; }
  get newsId(): string { return this.props.newsId; }
  get editorId(): string { return this.props.editorId; }
  get submittedToAdminId(): string | null { return this.props.submittedToAdminId; }
  get adminId(): string | null { return this.props.adminId; }
  get status(): ApprovalStatus { return this.props.status; }
  get comment(): string | null { return this.props.comment; }
  get seenByAdminAt(): Date | null { return this.props.seenByAdminAt; }
  get seenByEditorAt(): Date | null { return this.props.seenByEditorAt; }
  get reviewedAt(): Date | null { return this.props.reviewedAt; }
  get createdAt(): Date { return this.props.createdAt; }

  process(adminId: string, status: ApprovalStatus, comment?: string): void {
    this.props.adminId = adminId;
    this.props.status = status;
    this.props.comment = comment ?? null;
    this.props.reviewedAt = new Date();
  }

  markSeenByAdmin(): void {
    if (!this.props.seenByAdminAt) {
      this.props.seenByAdminAt = new Date();
    }
  }

  markSeenByEditor(): void {
    if (!this.props.seenByEditorAt) {
      this.props.seenByEditorAt = new Date();
    }
  }

  isAssignedTo(adminId: string): boolean {
    return this.props.submittedToAdminId === null || this.props.submittedToAdminId === adminId;
  }
}
