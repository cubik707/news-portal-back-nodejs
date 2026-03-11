import { UserDomain } from '../../../../core/domain/user/entities/user.domain';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserRole } from '../../../../core/shared/enums/user-role.enum';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): UserDomain {
    const domain = new UserDomain();
    domain.id = orm.id;
    domain.username = orm.username;
    domain.email = orm.email;
    domain.passwordHash = orm.passwordHash;
    domain.isApproved = orm.isApproved;
    domain.createdAt = orm.createdAt;
    domain.roles = (orm.roles ?? []).map((r) => r.name as UserRole);

    if (orm.userInfo) {
      domain.lastName = orm.userInfo.lastName;
      domain.firstName = orm.userInfo.firstName;
      domain.surname = orm.userInfo.surname ?? undefined;
      domain.position = orm.userInfo.position ?? undefined;
      domain.department = orm.userInfo.department ?? undefined;
      domain.avatarUrl = orm.userInfo.avatarUrl ?? undefined;
    }

    return domain;
  }
}
