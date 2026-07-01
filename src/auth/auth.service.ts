import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService
      .findByEmail(email)
      .catch(() => null);
    if (existing) throw new ConflictException('Email นี้มีอยู่แล้วในระบบ');
    const user = await this.usersService.createUser(email, password);
    return { id: user._id, email: user.email, role: user.role };
  }
  async registerAdmin(email: string, password: string, secret: string) {
    if (secret !== process.env.ADMIN_SECRET) {
      throw new UnauthorizedException('ไม่มีสิทธิ์สร้าง admin');
    }
    console.log('ผ่าน if แล้ว');

    const existing = await this.usersService
      .findByEmail(email)
      .catch(() => null);
    if (existing) throw new ConflictException('Email นี้มีอยู่แล้วในระบบ');
    const user = await this.usersService.createUser(email, password, 'admin');
    return { id: user._id, email: user.email, role: user.role };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Email หรือ Password ไม่ถูกต้อง');
    const tokens = await this.generateTokens(
      String(user._id),
      user.email,
      user.role,
    );
    await this.usersService.saveRefreshToken(
      String(user._id),
      tokens.refresh_token,
    );
    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.validateRefreshToken(
      userId,
      refreshToken,
    );
    const tokens = await this.generateTokens(
      String(user._id),
      user.email,
      user.role,
    );
    await this.usersService.saveRefreshToken(
      String(user._id),
      tokens.refresh_token,
    );
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.saveRefreshToken(userId, null);
    return { message: 'ออกจากระบบสำเร็จ' };
  }

  async verifyToken(token: string) {
    try {
      const payload = await Promise.resolve(
        this.jwtService.verify<JwtPayload>(token, {
          secret: process.env.JWT_SECRET,
        }),
      );
      return { valid: true, payload };
    } catch (error) {
      console.log('verify error:', error);
      return { valid: false, payload: null };
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '1h',
      }),
    ]);
    return { access_token, refresh_token };
  }
}
