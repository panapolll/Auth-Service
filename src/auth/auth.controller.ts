import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './Guard/auth.guard';
import { Public } from './Decorator/public.decorator';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterAdminDto,
  RegisterDto,
} from './DTO/auth.dto';

interface RequestWithUser extends Request {
  user: { userId: string; email: string; role: string };
}

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Public()
  @Post('register-admin')
  registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto.email, dto.password, dto.secret);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.userId, dto.refreshToken);
  }

  @Post('logout')
  logout(@Req() req: RequestWithUser) {
    return this.authService.logout(req.user.userId);
  }

  @Public()
  @Post('verify')
  verify(@Body() body: { token: string }) {
    return this.authService.verifyToken(body.token);
  }

  @Get('me')
  me(@Req() req: RequestWithUser) {
    return req.user;
  }
}
