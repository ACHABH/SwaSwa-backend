import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Observable, from, switchMap } from 'rxjs';
import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class RlsInterceptor implements NestInterceptor {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();

    if (!req.user) {
      return next.handle();
    }

    return from(
      this.dataSource.query(
        `SELECT set_config('app.user_id', $1, true),
                set_config('app.user_role', $2, true)`,
        [req.user.sub, req.user.role],
      ),
    ).pipe(switchMap(() => next.handle()));
  }
}
