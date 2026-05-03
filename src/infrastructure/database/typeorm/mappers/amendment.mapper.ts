import { Amendment } from '../../../../core/domain/amendment/entities/amendment.domain';
import { AmendmentOrmEntity } from '../entities/amendment.orm-entity';

export class AmendmentMapper {
  static toDomain(orm: AmendmentOrmEntity): Amendment {
    let userFullName = '';
    if (orm.user?.userInfo) {
      const { lastName, firstName, surname } = orm.user.userInfo;
      userFullName = [lastName, firstName, surname].filter(Boolean).join(' ');
    }

    return Amendment.reconstitute({
      id: orm.id,
      userId: orm.userId,
      userFullName,
      comment: orm.comment,
      status: orm.status,
      rejectionReason: orm.rejectionReason ?? null,
      seenByUser: orm.seenByUser,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      reviewedAt: orm.reviewedAt ?? null,
      reviewedBy: orm.reviewedBy ?? null,
    });
  }
}
