import { User } from '../../../../core/domain/user/entities/user.domain';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { Email } from '../../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../../core/shared/value-objects/password-hash.vo';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return User.reconstitute({
      id: orm.id,
      username: orm.username,
      email: new Email(orm.email),
      passwordHash: PasswordHash.fromHash(orm.passwordHash),
      isApproved: orm.isApproved,
      roles: (orm.roles ?? []).map((r) => r.name),
      createdAt: orm.createdAt,
      lastName: orm.userInfo?.lastName ?? '',
      firstName: orm.userInfo?.firstName ?? '',
      surname: orm.userInfo?.surname || undefined,
      position: orm.userInfo?.position || undefined,
      department: orm.userInfo?.department || undefined,
      avatarUrl: orm.userInfo?.avatarUrl || undefined,
    });
  }
}
