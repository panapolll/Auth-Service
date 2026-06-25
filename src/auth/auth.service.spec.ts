jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  saveRefreshToken: jest.fn(),
  validateRefreshToken: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock_token'),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('สมัครสำเร็จ', async () => {
      mockUsersService.findByEmail.mockRejectedValue(new Error('not found'));
      mockUsersService.createUser.mockResolvedValue({
        _id: '123',
        email: 'test@test.com',
        role: 'user',
      });

      const result = await authService.register('test@test.com', '123456');
      expect(result).toEqual({
        id: '123',
        email: 'test@test.com',
        role: 'user',
      });
    });

    it('email ซ้ำ → throw ConflictException', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        email: 'test@test.com',
      });

      await expect(
        authService.register('test@test.com', '123456'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('login สำเร็จ → ได้ tokens', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        _id: '123',
        email: 'test@test.com',
        password: 'hashedPassword',
        role: 'user',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersService.saveRefreshToken.mockResolvedValue(undefined);

      const result = await authService.login('test@test.com', '123456');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('password ผิด → throw UnauthorizedException', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        _id: '123',
        email: 'test@test.com',
        password: 'hashedPassword',
        role: 'user',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@test.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('logout สำเร็จ', async () => {
      mockUsersService.saveRefreshToken.mockResolvedValue(undefined);

      const result = await authService.logout('123');
      expect(result).toEqual({ message: 'ออกจากระบบสำเร็จ' });
    });
  });
});
