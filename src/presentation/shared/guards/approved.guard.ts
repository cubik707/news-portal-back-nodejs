import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApprovedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{ user: { isApproved: boolean } }>();

    if (!user?.isApproved) {
      throw new UnauthorizedException('Account is not approved');
    }

    return true;
  }
}
