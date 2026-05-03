import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { UsersController } from './users.controller';
import { GetAllUsersUseCase } from '../../application/user/use-cases/get-all-users.use-case';
import { GetUserUseCase } from '../../application/user/use-cases/get-user.use-case';
import { CreateUserUseCase } from '../../application/user/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../application/user/use-cases/update-user.use-case';
import { UpdateUserFieldUseCase } from '../../application/user/use-cases/update-user-field.use-case';
import { DeleteUserUseCase } from '../../application/user/use-cases/delete-user.use-case';
import { GetUsersByRoleUseCase } from '../../application/user/use-cases/get-users-by-role.use-case';
import { UpdateUserAvatarUseCase } from '../../application/user/use-cases/update-user-avatar.use-case';
import { GetPendingUsersCountUseCase } from '../../application/user/use-cases/get-pending-users-count.use-case';
import { ApproveUserUseCase } from '../../application/user/use-cases/approve-user.use-case';
import { BcryptPasswordHasher } from '../../infrastructure/security/bcrypt-password-hasher';
import { PASSWORD_HASHER } from '../../core/shared/ports/password-hasher.port';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    GetAllUsersUseCase,
    GetUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    UpdateUserFieldUseCase,
    DeleteUserUseCase,
    GetUsersByRoleUseCase,
    UpdateUserAvatarUseCase,
    GetPendingUsersCountUseCase,
    ApproveUserUseCase,
  ],
})
export class UsersModule {}
