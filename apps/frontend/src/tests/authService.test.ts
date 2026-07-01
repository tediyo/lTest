import MockAdapter from 'axios-mock-adapter';
import { authApi, authService } from '../services/auth.service';

const mock = new MockAdapter(authApi);

describe('authService', () => {
  afterEach(() => {
    mock.reset();
  });

  describe('login', () => {
    it('should return login response on success', async () => {
      const mockResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: { id: 'user-id', email: 'test@example.com' },
          tokens: { accessToken: 'access-token-123' },
        },
      };

      mock.onPost('/auth/login').reply(200, mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.tokens.accessToken).toBe('access-token-123');
    });

    it('should throw on 401 unauthorized', async () => {
      mock.onPost('/auth/login').reply(401, {
        success: false,
        message: 'Invalid email or password',
      });

      await expect(
        authService.login({ email: 'bad@example.com', password: 'wrongpass' }),
      ).rejects.toThrow();
    });

    it('should throw on network error', async () => {
      mock.onPost('/auth/login').networkError();

      await expect(
        authService.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should return registration response on success', async () => {
      const mockResponse = {
        success: true,
        message: 'Registration successful',
        data: {
          user: { id: 'new-user-id', email: 'new@example.com' },
          tokens: { accessToken: 'new-access-token' },
        },
      };

      mock.onPost('/auth/register').reply(201, mockResponse);

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('new@example.com');
      expect(result.data?.tokens.accessToken).toBe('new-access-token');
    });

    it('should throw on 409 conflict (email already exists)', async () => {
      mock.onPost('/auth/register').reply(409, {
        success: false,
        message: 'An account with this email already exists',
      });

      await expect(
        authService.register({ email: 'existing@example.com', password: 'password123' }),
      ).rejects.toThrow();
    });

    it('should throw on network error', async () => {
      mock.onPost('/auth/register').networkError();

      await expect(
        authService.register({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should call logout endpoint with Bearer token', async () => {
      mock.onPost('/auth/logout').reply(200, { success: true, message: 'Logout successful' });

      const result = await authService.logout('valid-token');

      expect(result.success).toBe(true);
      expect(mock.history.post[0].headers?.Authorization).toBe('Bearer valid-token');
    });
  });

  describe('getUsers', () => {
    it('should return users list with Bearer token', async () => {
      const mockUsers = {
        success: true,
        message: 'Users retrieved successfully',
        data: [
          { id: 'user-1', email: 'a@example.com' },
          { id: 'user-2', email: 'b@example.com' },
        ],
      };

      mock.onGet('/auth/users').reply(200, mockUsers);

      const result = await authService.getUsers('valid-token');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mock.history.get[0].headers?.Authorization).toBe('Bearer valid-token');
    });

    it('should throw on 401 unauthorized', async () => {
      mock.onGet('/auth/users').reply(401, { success: false, message: 'Unauthorized' });

      await expect(authService.getUsers('bad-token')).rejects.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should call profile endpoint with Bearer token', async () => {
      const mockProfile = {
        success: true,
        message: 'Profile retrieved',
        data: { id: 'user-id', email: 'test@example.com' },
      };

      mock.onGet('/auth/profile').reply(200, mockProfile);

      const result = await authService.getProfile('valid-token');

      expect(result.success).toBe(true);
      expect(mock.history.get[0].headers?.Authorization).toBe('Bearer valid-token');
    });

    it('should throw on 401 unauthorized', async () => {
      mock.onGet('/auth/profile').reply(401, { success: false, message: 'Unauthorized' });

      await expect(authService.getProfile('bad-token')).rejects.toThrow();
    });
  });
});
