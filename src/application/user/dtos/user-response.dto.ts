import { User } from '../../../core/domain/user/entities/user.domain';
import { UserRole } from '../../../core/shared/enums/user-role.enum';

export class UserResponseDto {
  id!: string;
  username!: string;
  email!: string;
  lastName!: string;
  firstName!: string;
  surname?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  isApproved!: boolean;
  roles!: UserRole[];

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.email = user.email.getValue();
    dto.lastName = user.lastName;
    dto.firstName = user.firstName;
    dto.surname = user.surname;
    dto.position = user.position;
    dto.department = user.department;
    dto.avatarUrl = user.avatarUrl;
    dto.isApproved = user.isApproved;
    dto.roles = user.roles;
    return dto;
  }
}
