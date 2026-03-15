import { User } from '../../../core/domain/user/entities/user.domain';

export class UserForNewsDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  surname?: string;
  avatarUrl?: string;

  static fromDomain(user: User): UserForNewsDto {
    const dto = new UserForNewsDto();
    dto.id = user.id;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.surname = user.surname;
    dto.avatarUrl = user.avatarUrl;
    return dto;
  }
}
