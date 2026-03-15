import { Injectable } from '@nestjs/common';

@Injectable()
export class VerifyTokenUseCase {
  execute(): boolean {
    // JWT validity is already enforced by JwtAuthGuard before this runs
    return true;
  }
}
