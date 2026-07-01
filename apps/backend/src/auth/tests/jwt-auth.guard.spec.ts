import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';

const mockAuthService = {
  getProfile: jest.fn(),
};

function createMockExecutionContext(authHeader?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: authHeader,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard(mockAuthService as unknown as AuthService);
    jest.clearAllMocks();
  });

  it('should allow access when a valid Bearer token is provided', async () => {
    mockAuthService.getProfile.mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
    });

    const context = createMockExecutionContext('Bearer valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockAuthService.getProfile).toHaveBeenCalledWith('valid-token');
  });

  it('should throw UnauthorizedException when no Authorization header is present', async () => {
    const context = createMockExecutionContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Authentication token is required',
    );
  });

  it('should throw UnauthorizedException when token is not a Bearer token', async () => {
    const context = createMockExecutionContext('Basic sometoken');

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when getProfile throws', async () => {
    mockAuthService.getProfile.mockRejectedValue(
      new UnauthorizedException('Invalid token'),
    );

    const context = createMockExecutionContext('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
