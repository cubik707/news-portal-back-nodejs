import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../core/domain/user/repositories/user.repository.interface';
import { UserRole } from '../../core/shared/enums/user-role.enum';

export interface JwtUserPayload {
  id: string;
  username: string;
  roles: UserRole[];
  isApproved: boolean;
}

interface JwtTokenPayload {
  sub: string;
  roles: UserRole[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: JwtTokenPayload): Promise<JwtUserPayload> {
    const user = await this.userRepository.findByUsername(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      roles: user.roles,
      isApproved: user.isApproved,
    };
  }
}
