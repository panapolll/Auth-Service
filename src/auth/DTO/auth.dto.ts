import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'กรุณาใส่อีเมลให้ถูกต้อง' })
  email!: string;
  @IsString()
  @MinLength(6, { message: 'Password ต้องมีอย่างน้อย 6 หลัก' })
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @IsEmail()
  refreshToken!: string;
  @IsEmail()
  userId!: string;
}

export class RegisterAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  secret!: string;
}
