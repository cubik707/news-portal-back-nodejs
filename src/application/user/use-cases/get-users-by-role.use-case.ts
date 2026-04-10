import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../../core/domain/user/repositories/user.repository.interface';
import { User } from '../../../core/domain/user/entities/user.domain';
import { UserRole } from '../../../core/shared/enums/user-role.enum';

@Injectable()
export class GetUsersByRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(role: UserRole): Promise<User[]> {
    return this.userRepo.findAllByRole(role);
  }
}
