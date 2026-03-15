import { Body, Controller, Delete, Param, Patch, UseGuards } from '@nestjs/common';
import { ApproveUserUseCase } from '../../application/user/use-cases/approve-user.use-case';
import { AssignRoleUseCase } from '../../application/user/use-cases/assign-role.use-case';
import { RemoveRoleUseCase } from '../../application/user/use-cases/remove-role.use-case';
import { UpdateRoleRequestDto } from '../../application/user/dtos/update-role-request.dto';
import { UserResponseDto } from '../../application/user/dtos/user-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, ApprovedGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly approveUser: ApproveUserUseCase,
    private readonly assignRole: AssignRoleUseCase,
    private readonly removeRole: RemoveRoleUseCase,
  ) {}

  @Patch('users/:id/approve')
  async approve(@Param('id') id: string): Promise<SuccessResponseDto<UserResponseDto>> {
    const user = await this.approveUser.execute(id);
    return new SuccessResponseDto(UserResponseDto.fromDomain(user), 'User approved');
  }

  @Patch('users/:id/roles')
  async addRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleRequestDto,
  ): Promise<SuccessResponseDto<UserResponseDto>> {
    const user = await this.assignRole.execute(id, dto.role);
    return new SuccessResponseDto(UserResponseDto.fromDomain(user), 'Role assigned');
  }

  @Delete('users/:id/roles')
  async deleteRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleRequestDto,
  ): Promise<SuccessResponseDto<UserResponseDto>> {
    const user = await this.removeRole.execute(id, dto.role);
    return new SuccessResponseDto(UserResponseDto.fromDomain(user), 'Role removed');
  }
}
