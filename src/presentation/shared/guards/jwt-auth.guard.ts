import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<T>(err: Error | null, user: T, info: Error | null, context: ExecutionContext): T {
    const request = context.switchToHttp().getRequest<{ method: string; url: string }>();
    const endpoint = `${request.method} ${request.url}`;

    if (err || !user) {
      const reason = info?.message ?? err?.message ?? 'No token provided';
      this.logger.warn(`Auth failed [${endpoint}]: ${reason}`);
      throw err instanceof UnauthorizedException ? err : new UnauthorizedException(reason);
    }

    return user;
  }
}
