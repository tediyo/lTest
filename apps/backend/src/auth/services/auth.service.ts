import {
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginResponse, AuthUser } from '../interfaces/auth.interface';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    try {
      const { data, error } = await this.supabaseService.signInWithPassword(email, password);

      if (error) {
        this.logger.warn(`Failed login attempt for email: ${email} - ${error.message}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!data || !data.user || !data.session) {
        this.logger.error(`Unexpected null data from Supabase for email: ${email}`);
        throw new InternalServerErrorException('Authentication failed unexpectedly');
      }

      const supabaseUser = data.user as {
        id: string;
        email?: string;
        created_at?: string;
      };
      const supabaseSession = data.session as {
        access_token: string;
        refresh_token?: string;
        expires_at?: number;
      };

      this.logger.log(`Successful login for user: ${supabaseUser.id}`);

      return {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || email,
          createdAt: supabaseUser.created_at,
        },
        tokens: {
          accessToken: supabaseSession.access_token,
          refreshToken: supabaseSession.refresh_token,
          expiresAt: supabaseSession.expires_at,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Unexpected error during login for email: ${email}`, (error as Error).stack);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const { email, password } = registerDto;

    try {
      const { data, error } = await this.supabaseService.signUp(email, password);

      if (error) {
        this.logger.warn(`Failed registration for email: ${email} - ${error.message}`);
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already been registered')) {
          throw new ConflictException('An account with this email already exists');
        }
        if (msg.includes('rate limit')) {
          throw new ConflictException('Too many sign-up attempts. Please try again later.');
        }
        throw new InternalServerErrorException(`Registration failed: ${error.message}`);
      }

      if (!data || !data.user) {
        this.logger.error(`Unexpected null data from Supabase during registration for email: ${email}`);
        throw new InternalServerErrorException('Registration failed unexpectedly');
      }

      const supabaseUser = data.user as { id: string; email?: string; created_at?: string };
      const supabaseSession = data.session as {
        access_token: string;
        refresh_token?: string;
        expires_at?: number;
      } | null;

      this.logger.log(`Successful registration for user: ${supabaseUser.id}`);

      return {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || email,
          createdAt: supabaseUser.created_at,
        },
        tokens: {
          accessToken: supabaseSession?.access_token || '',
          refreshToken: supabaseSession?.refresh_token,
          expiresAt: supabaseSession?.expires_at,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Unexpected error during registration for email: ${email}`, (error as Error).stack);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async logout(accessToken: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.signOut(accessToken);

      if (error) {
        this.logger.warn(`Error during logout: ${error.message}`);
      } else {
        this.logger.log('User logged out successfully');
      }
    } catch (error) {
      this.logger.error('Unexpected error during logout', (error as Error).stack);
    }
  }

  async getProfile(accessToken: string): Promise<{ id: string; email: string }> {
    try {
      const { data, error } = await this.supabaseService.getUser(accessToken);

      if (error || !data?.user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const user = data.user as { id: string; email?: string };
      return {
        id: user.id,
        email: user.email || '',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching profile', (error as Error).stack);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async getUsers(): Promise<AuthUser[]> {
    try {
      const { data, error } = await this.supabaseService.listUsers();

      if (error) {
        this.logger.warn(`Failed to fetch users - ${error.message}`);
        throw new InternalServerErrorException('Failed to fetch registered users');
      }

      const users = (data?.users || []) as {
        id: string;
        email?: string;
        created_at?: string;
      }[];

      return users.map((user) => ({
        id: user.id,
        email: user.email || '',
        createdAt: user.created_at,
      }));
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching users', (error as Error).stack);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
