import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { EmailModule } from '../../infrastructure/email/email.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthenticateUserUseCase } from '../../application/auth/use-cases/authenticate-user.use-case';
import { RegisterUserUseCase } from '../../application/user/use-cases/register-user.use-case';
import { VerifyTokenUseCase } from '../../application/auth/use-cases/verify-token.use-case';
import { NestJwtAdapter } from '../../infrastructure/security/nest-jwt.adapter';
import { BcryptPasswordHasher } from '../../infrastructure/security/bcrypt-password-hasher';
import { JWT_SERVICE } from '../../core/shared/ports/jwt.port';
import { PASSWORD_HASHER } from '../../core/shared/ports/password-hasher.port';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: 14400 },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: JWT_SERVICE, useClass: NestJwtAdapter },
    JwtStrategy,
    AuthenticateUserUseCase,
    RegisterUserUseCase,
    VerifyTokenUseCase,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
