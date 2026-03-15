import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '../../../core/shared/ports/password-hasher.port';
import { IJwtService, JWT_SERVICE } from '../../../core/shared/ports/jwt.port';
import { InvalidCredentialsException } from '../../../core/domain/auth/exceptions/invalid-credentials.exception';
import { UserNotApprovedException } from '../../../core/domain/user/exceptions/user-not-approved.exception';

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,
  ) {}

  async execute(username: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isValid = await user.validatePassword(password, this.passwordHasher);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    if (!user.isApproved) {
      throw new UserNotApprovedException();
    }

    const token = this.jwtService.sign({ sub: user.username, roles: user.roles });
    return { token };
  }
}
