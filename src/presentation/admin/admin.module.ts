import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AdminController } from './admin.controller';
import { ApproveUserUseCase } from '../../application/user/use-cases/approve-user.use-case';
import { AssignRoleUseCase } from '../../application/user/use-cases/assign-role.use-case';
import { RemoveRoleUseCase } from '../../application/user/use-cases/remove-role.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [ApproveUserUseCase, AssignRoleUseCase, RemoveRoleUseCase],
})
export class AdminModule {}
