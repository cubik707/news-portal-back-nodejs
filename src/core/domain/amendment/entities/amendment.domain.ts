import { uuidv7 } from 'uuidv7';
import { AmendmentStatus } from '../../../shared/enums/amendment-status.enum';

export interface AmendmentProps {
  id: string;
  userId: string;
  userFullName: string;
  comment: string;
  status: AmendmentStatus;
  rejectionReason: string | null;
  seenByUser: boolean;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}

export class Amendment {
  private constructor(private readonly props: AmendmentProps) {}

  static create(props: { userId: string; comment: string }): Amendment {
    const now = new Date();
    return new Amendment({
      id: uuidv7(),
      userId: props.userId,
      userFullName: '',
      comment: props.comment,
      status: AmendmentStatus.PENDING,
      rejectionReason: null,
      seenByUser: false,
      createdAt: now,
      updatedAt: now,
      reviewedAt: null,
      reviewedBy: null,
    });
  }

  static reconstitute(props: AmendmentProps): Amendment {
    return new Amendment(props);
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get userFullName(): string {
    return this.props.userFullName;
  }
  get comment(): string {
    return this.props.comment;
  }
  get status(): AmendmentStatus {
    return this.props.status;
  }
  get rejectionReason(): string | null {
    return this.props.rejectionReason;
  }
  get seenByUser(): boolean {
    return this.props.seenByUser;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get reviewedAt(): Date | null {
    return this.props.reviewedAt;
  }
  get reviewedBy(): string | null {
    return this.props.reviewedBy;
  }

  approve(reviewedBy: string): void {
    this.props.status = AmendmentStatus.APPROVED;
    this.props.reviewedBy = reviewedBy;
    this.props.reviewedAt = new Date();
    this.props.updatedAt = new Date();
  }

  reject(reviewedBy: string, rejectionReason?: string): void {
    this.props.status = AmendmentStatus.REJECTED;
    this.props.reviewedBy = reviewedBy;
    this.props.reviewedAt = new Date();
    this.props.rejectionReason = rejectionReason ?? null;
    this.props.updatedAt = new Date();
  }

  markSeen(): void {
    this.props.seenByUser = true;
    this.props.updatedAt = new Date();
  }
}
