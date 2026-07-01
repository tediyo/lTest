import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginResponse } from '../interfaces/auth.interface';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getProfile: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<typeof mockAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'new@example.com',
      password: 'password123',
    };

    it('should return success response with registration data', async () => {
      const registerResult: LoginResponse = {
        user: { id: 'new-user-id', email: 'new@example.com' },
        tokens: { accessToken: 'new-access-token' },
      };

      authService.register.mockResolvedValue(registerResult);

      const result = await controller.register(registerDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Registration successful');
      expect(result.data).toEqual(registerResult);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return success response with login data', async () => {
      const loginResult: LoginResponse = {
        user: { id: 'user-id', email: 'test@example.com' },
        tokens: { accessToken: 'access-token' },
      };

      authService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(result.data).toEqual(loginResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should propagate UnauthorizedException from service', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return profile from request user', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockReq = {
        user: mockUser,
        headers: { authorization: 'Bearer valid-token' },
      } as any;

      const result = await controller.getProfile(mockReq);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should call logout service and return success', async () => {
      authService.logout.mockResolvedValue(undefined);

      const mockReq = {
        user: { id: 'user-id', email: 'test@example.com' },
        headers: { authorization: 'Bearer valid-token' },
      } as any;

      const result = await controller.logout(mockReq);

      expect(result.success).toBe(true);
      expect(authService.logout).toHaveBeenCalledWith('valid-token');
    });
  });
});
