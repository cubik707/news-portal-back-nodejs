import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { GetAllUsersUseCase } from '../../application/user/use-cases/get-all-users.use-case';
import { GetUserUseCase } from '../../application/user/use-cases/get-user.use-case';
import { CreateUserUseCase } from '../../application/user/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../application/user/use-cases/update-user.use-case';
import { UpdateUserFieldUseCase } from '../../application/user/use-cases/update-user-field.use-case';
import { DeleteUserUseCase } from '../../application/user/use-cases/delete-user.use-case';
import { UserRegistrationDto } from '../../application/user/dtos/user-registration.dto';
import { UserResponseDto } from '../../application/user/dtos/user-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, ApprovedGuard)
export class UsersController {
  constructor(
    private readonly getAllUsers: GetAllUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly updateUserField: UpdateUserFieldUseCase,
    private readonly deleteUser: DeleteUserUseCase,
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
