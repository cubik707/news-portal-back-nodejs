import { Amendment } from '../../../core/domain/amendment/entities/amendment.domain';
import { AmendmentStatus } from '../../../core/shared/enums/amendment-status.enum';

export class AmendmentResponseDto {
  id!: string;
  userId!: string;
  userFullName!: string;
  comment!: string;
  status!: AmendmentStatus;
  rejectionReason!: string | null;
  seenByUser!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  reviewedAt!: Date | null;
  reviewedBy!: string | null;

  static fromDomain(amendment: Amendment): AmendmentResponseDto {
    const dto = new AmendmentResponseDto();
    dto.id = amendment.id;
    dto.userId = amendment.userId;
    dto.userFullName = amendment.userFullName;
    dto.comment = amendment.comment;
    dto.status = amendment.status;
    dto.rejectionReason = amendment.rejectionReason;
    dto.seenByUser = amendment.seenByUser;
    dto.createdAt = amendment.createdAt;
    dto.updatedAt = amendment.updatedAt;
    dto.reviewedAt = amendment.reviewedAt;
    dto.reviewedBy = amendment.reviewedBy;
    return dto;
  }
}
