import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthenticateUserUseCase } from '../../application/auth/use-cases/authenticate-user.use-case';
import { RegisterUserUseCase } from '../../application/user/use-cases/register-user.use-case';
import { VerifyTokenUseCase } from '../../application/auth/use-cases/verify-token.use-case';
import { GetUserUseCase } from '../../application/user/use-cases/get-user.use-case';
import { AuthRequestDto } from '../../application/auth/dtos/auth-request.dto';
import { UserRegistrationDto } from '../../application/user/dtos/user-registration.dto';
import { UserResponseDto } from '../../application/user/dtos/user-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { Public } from '../shared/decorators/public.decorator';
import type { JwtUserPayload } from './jwt.strategy';

@Controller()
export class AuthController {
  constructor(
    private readonly authenticateUser: AuthenticateUserUseCase,
    private readonly registerUser: RegisterUserUseCase,
    private readonly verifyToken: VerifyTokenUseCase,
    private readonly getUser: GetUserUseCase,
  ) {}

  @Public()
  @Post('auth')
  async login(@Body() dto: AuthRequestDto): Promise<SuccessResponseDto<{ token: string }>> {
    const result = await this.authenticateUser.execute(dto.username, dto.password);
    return new SuccessResponseDto(result, 'Login successful');
  }

  @Public()
  @Post('register')
  async register(@Body() dto: UserRegistrationDto): Promise<SuccessResponseDto<UserResponseDto>> {
    const user = await this.registerUser.execute({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      lastName: dto.lastName,
      firstName: dto.firstName,
      surname: dto.surname,
      position: dto.position,
      department: dto.department,
    });
    return new SuccessResponseDto(UserResponseDto.fromDomain(user), 'User registered successfully');
  }

  @UseGuards(ApprovedGuard)
  @Get('me')
  async getMe(
    @CurrentUser() jwtUser: JwtUserPayload,
  ): Promise<SuccessResponseDto<UserResponseDto>> {
    const user = await this.getUser.execute(jwtUser.id);
    return new SuccessResponseDto(UserResponseDto.fromDomain(user), 'Current user retrieved');
  }

  @Get('verify-token')
  verifyTokenEndpoint(): SuccessResponseDto<boolean> {
    const result = this.verifyToken.execute();
    return new SuccessResponseDto(result, 'Token is valid');
  }
}
