import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'Youcef' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Benali' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'youcef@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Str0ng!Pass',
    description: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  password!: string;

  @ApiPropertyOptional({
    enum: [UserRole.BUYER, UserRole.SELLER],
    default: UserRole.BUYER,
    description: 'Staff roles are admin-assigned only',
  })
  @IsOptional()
  @IsEnum([UserRole.BUYER, UserRole.SELLER])
  role?: UserRole.BUYER | UserRole.SELLER;
}
