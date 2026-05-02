import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { GetAllUsersUseCase } from '../../application/user/use-cases/get-all-users.use-case';
import { GetUserUseCase } from '../../application/user/use-cases/get-user.use-case';
import { CreateUserUseCase } from '../../application/user/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../application/user/use-cases/update-user.use-case';
import { UpdateUserFieldUseCase } from '../../application/user/use-cases/update-user-field.use-case';
import { DeleteUserUseCase } from '../../application/user/use-cases/delete-user.use-case';
import { GetUsersByRoleUseCase } from '../../application/user/use-cases/get-users-by-role.use-case';
import { UpdateUserAvatarUseCase } from '../../application/user/use-cases/update-user-avatar.use-case';
import { GetPendingUsersCountUseCase } from '../../application/user/use-cases/get-pending-users-count.use-case';
import { UserRegistrationDto } from '../../application/user/dtos/user-registration.dto';
import { UserAvatarUpdateDto } from '../../application/user/dtos/user-avatar-update.dto';
import { UserResponseDto } from '../../application/user/dtos/user-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';
import type { JwtUserPayload } from '../auth/jwt.strategy';

@Controller('users')
@UseGuards(ApprovedGuard)
export class UsersController {
  constructor(
    private readonly getAllUsers: GetAllUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly updateUserField: UpdateUserFieldUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly getUsersByRole: GetUsersByRoleUseCase,
    private readonly updateUserAvatar: UpdateUserAvatarUseCase,
    private readonly getPendingUsersCount: GetPendingUsersCountUseCase,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<SuccessResponseDto<UserResponseDto[]>> {
    const users = await this.getAllUsers.execute();
    return new SuccessResponseDto(
      users.map((u) => UserResponseDto.fromDomain(u)),
      'Users retrieved',
    );
  }

  // Must be declared BEFORE @Get(':id') to avoid route conflict
  @Get('admins')
  async findAdmins(): Promise<SuccessResponseDto<UserResponseDto[]>> {
    const users = await this.getUsersByRole.execute(UserRole.ADMIN);
    return new SuccessResponseDto(
      users.map((u) => UserResponseDto.fromDomain(u)),
      'Admins retrieved',
    );
  }

  // Must be declared BEFORE @Get(':id') to avoid route conflict
  @Get('pending/count')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingCount(): Promise<SuccessResponseDto<{ count: number }>> {
    const count = await this.getPendingUsersCount.execute();
    return new SuccessResponseDto({ count }, 'Pending users count');
  }

  // Must be declared BEFORE @Patch(':id') to avoid route conflict
  @Patch('me/avatar')
  async updateMyAvatar(
    @Body() dto: UserAvatarUpdateDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<UserResponseDto>> {
    const updatedUser = await this.updateUserAvatar.execute({
      userId: user.id,
      avatarUrl: dto.avatarUrl,
    });
    return new SuccessResponseDto(UserResponseDto.fromDomain(updatedUser), 'Avatar updated');
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<UserResponseDto>> {
    const user = await this.getUser.execute(id);
    return new SuccessResponseDto(UserResponseDto.fromDomain(user), 'User retrieved');
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: UserRegistrationDto): Promise<SuccessResponseDto<UserResponseDto>> {
    const user = await this.createUser.execute({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      lastName: dto.lastName,
      firstName: dto.firstName,
      surname: dto.surname,
      position: dto.position,
      department: dto.department,
    });
    return new SuccessResponseDto(UserResponseDto.fromDomain(user), 'User created');
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UserRegistrationDto,
  ): Promise<SuccessResponseDto<UserResponseDto>> {
    const user = await this.updateUser.execute({
      id,
      username: dto.username,
      email: dto.email,
      password: dto.password,
      lastName: dto.lastName,
      firstName: dto.firstName,
      surname: dto.surname,
      position: dto.position,
      department: dto.department,
    });
    return new SuccessResponseDto(UserResponseDto.fromDomain(user), 'User updated');
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateField(
    @Param('id') id: string,
    @Body() fields: Record<string, unknown>,
  ): Promise<SuccessResponseDto<UserResponseDto>> {
    const user = await this.updateUserField.execute(id, fields);
    return new SuccessResponseDto(UserResponseDto.fromDomain(user), 'User updated');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<SuccessResponseDto<null>> {
    await this.deleteUser.execute(id);
    return new SuccessResponseDto(null, 'User deleted');
  }
}
