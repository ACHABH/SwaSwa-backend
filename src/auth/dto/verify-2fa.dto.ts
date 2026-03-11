import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, Length } from 'class-validator';

export class Verify2faDto {
  @ApiProperty({ example: '483921', description: '6-digit OTP' })
  @IsNumberString()
  @Length(6, 6)
  otp!: string;
}
