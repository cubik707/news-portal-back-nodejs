import { ApprovalStatus } from '../../../shared/enums/approval-status.enum';

export interface NewsApprovalProps {
  id: string;
  newsId: string;
  editorId: string;
  status: ApprovalStatus;
  comment: string | null;
  reviewedAt: Date;
}

export class NewsApproval {
  private constructor(private readonly props: NewsApprovalProps) {}

  static reconstitute(props: NewsApprovalProps): NewsApproval {
    return new NewsApproval(props);
  }

  get id(): string {
    return this.props.id;
  }

  get newsId(): string {
    return this.props.newsId;
  }

  get editorId(): string {
    return this.props.editorId;
  }

  get status(): ApprovalStatus {
    return this.props.status;
  }

  get comment(): string | null {
    return this.props.comment;
  }

  get reviewedAt(): Date {
    return this.props.reviewedAt;
  }

  process(status: ApprovalStatus, comment?: string): void {
    this.props.status = status;
    this.props.comment = comment ?? null;
    this.props.reviewedAt = new Date();
  }
}
