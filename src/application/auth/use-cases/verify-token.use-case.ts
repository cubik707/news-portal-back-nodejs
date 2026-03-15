import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class VerifyTokenUseCase {
  constructor(private readonly jwtService: JwtService) {}

  execute(token: string): { valid: boolean } {
    try {
      this.jwtService.verify(token);
      return { valid: true };
    } catch {
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }
}
