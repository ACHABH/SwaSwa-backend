import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthProvider } from '../../common/enums/auth-provider.enum';

@Entity({ name: 'users', schema: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ name: 'phone_number', length: 20, nullable: true, type: 'varchar' })
  phoneNumber!: string | null;

  @Column({
    name: 'password_hash',
    length: 255,
    nullable: true,
    type: 'varchar',
    select: false,
  })
  passwordHash!: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'text' })
  role!: UserRole;

  @Column({ name: 'auth_provider', type: 'text', default: AuthProvider.EMAIL })
  authProvider!: AuthProvider;

  @Column({
    name: 'oauth_provider_id',
    length: 255,
    nullable: true,
    type: 'varchar',
  })
  oauthProviderId!: string | null;

  @Column({ name: 'is_phone_verified', default: false })
  isPhoneVerified!: boolean;

  @Column({ name: 'is_banned', default: false })
  isBanned!: boolean;

  @Column({ name: 'is_2fa_enabled', default: false })
  is2faEnabled!: boolean;

  @Column({
    name: 'member_since',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  memberSince!: Date;

  @Column({
    name: 'preferred_language',
    type: 'char',
    length: 2,
    default: 'ar',
  })
  preferredLanguage!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
