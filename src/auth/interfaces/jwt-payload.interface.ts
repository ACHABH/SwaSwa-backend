import type { UserRole } from '../../common/enums/user-role.enum';

export interface JwtPayload {
  /** User UUID from users.users.id */
  sub: string;
  /** User role for guards and RLS */
  role: UserRole;
  /** Unique JWT ID — enables per-token revocation */
  jti: string;
}
