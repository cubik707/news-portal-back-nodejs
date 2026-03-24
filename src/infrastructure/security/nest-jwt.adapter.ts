import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtService } from '../../core/shared/ports/jwt.port';

@Injectable()
export class NestJwtAdapter implements IJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): Record<string, unknown> {
    return this.jwtService.verify<Record<string, unknown>>(token);
  }
}
