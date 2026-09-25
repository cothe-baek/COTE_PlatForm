import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthedRequest } from './jwt-auth.guard';
import type { JwtPayload } from './auth.service';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
  return ctx.switchToHttp().getRequest<AuthedRequest>().user;
});
