import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

const mockSupabaseService = {
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  listUsers: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: jest.Mocked<typeof mockSupabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    supabaseService = module.get(SupabaseService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return login response on successful login', async () => {
      const mockUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };
      const mockSession = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expires_at: 9999999999,
      };

      supabaseService.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await service.login(loginDto);

      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.accessToken).toBe(mockSession.access_token);
      expect(result.tokens.refreshToken).toBe(mockSession.refresh_token);
      expect(supabaseService.signInWithPassword).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      supabaseService.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials', status: 400 },
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw InternalServerErrorException when Supabase returns null data', async () => {
      supabaseService.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await expect(service.login(loginDto)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on unexpected Supabase exception', async () => {
      supabaseService.signInWithPassword.mockRejectedValue(
        new Error('Network timeout'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(InternalServerErrorException);
      await expect(service.login(loginDto)).rejects.toThrow('An unexpected error occurred');
    });
  });

  describe('logout', () => {
    it('should call signOut without throwing when successful', async () => {
      supabaseService.signOut.mockResolvedValue({ error: null });

      await expect(service.logout('access-token')).resolves.not.toThrow();
      expect(supabaseService.signOut).toHaveBeenCalledWith('access-token');
    });

    it('should not throw even when signOut returns an error', async () => {
      supabaseService.signOut.mockResolvedValue({
        error: { message: 'Token already expired', status: 400 },
      });

      await expect(service.logout('expired-token')).resolves.not.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should return user profile on valid token', async () => {
      const mockUser = { id: 'user-id-123', email: 'test@example.com' };
      supabaseService.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await service.getProfile('valid-token');

      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      supabaseService.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Invalid JWT', status: 401 },
      });

      await expect(service.getProfile('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      supabaseService.getUser.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.getProfile('token')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getUsers', () => {
    it('should return a list of registered users', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'a@example.com', created_at: '2024-01-01T00:00:00Z' },
        { id: 'user-2', email: 'b@example.com', created_at: '2024-01-02T00:00:00Z' },
      ];

      supabaseService.listUsers.mockResolvedValue({
        data: { users: mockUsers },
        error: null,
      });

      const result = await service.getUsers();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user-1');
      expect(result[0].email).toBe('a@example.com');
      expect(result[0].createdAt).toBe('2024-01-01T00:00:00Z');
    });

    it('should return an empty array when no users are found', async () => {
      supabaseService.listUsers.mockResolvedValue({
        data: { users: [] },
        error: null,
      });

      const result = await service.getUsers();

      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException when Supabase returns an error', async () => {
      supabaseService.listUsers.mockResolvedValue({
        data: null,
        error: { message: 'Database error', status: 500 },
      });

      await expect(service.getUsers()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      supabaseService.listUsers.mockRejectedValue(new Error('Network error'));

      await expect(service.getUsers()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'new@example.com',
      password: 'password123',
    };

    it('should return registration response on success', async () => {
      const mockUser = {
        id: 'new-user-id',
        email: 'new@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };
      const mockSession = {
        access_token: 'access-token-new',
        refresh_token: 'refresh-token-new',
        expires_at: 9999999999,
      };
      supabaseService.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await service.register(registerDto);

      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.accessToken).toBe(mockSession.access_token);
    });

    it('should throw ConflictException when email already registered', async () => {
      supabaseService.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered', status: 400 },
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on other Supabase errors', async () => {
      supabaseService.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Database error', status: 500 },
      });

      await expect(service.register(registerDto)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when user data is null', async () => {
      supabaseService.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await expect(service.register(registerDto)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      supabaseService.signUp.mockRejectedValue(new Error('Network error'));

      await expect(service.register(registerDto)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
