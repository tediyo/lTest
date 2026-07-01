import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, AuthError } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly adminClient: SupabaseClient;
  private readonly anonClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('app.supabaseUrl');
    const serviceRoleKey = this.configService.get<string>('app.supabaseServiceRoleKey');
    const anonKey = this.configService.get<string>('app.supabaseAnonKey');

    if (!url || !serviceRoleKey || !anonKey) {
      throw new Error('Supabase URL, Anon Key and Service Role Key are required');
    }

    this.adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    this.anonClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  getClient(): SupabaseClient {
    return this.adminClient;
  }

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<{ data: { user: unknown; session: unknown } | null; error: AuthError | null }> {
    this.logger.log(`Authentication attempt for email: ${email}`);
    return this.anonClient.auth.signInWithPassword({ email, password });
  }

  async signUp(
    email: string,
    password: string,
  ): Promise<{ data: { user: unknown; session: unknown } | null; error: AuthError | null }> {
    this.logger.log(`Registration attempt for email: ${email}`);
    return this.anonClient.auth.signUp({ email, password });
  }

  async signOut(accessToken: string): Promise<{ error: AuthError | null }> {
    this.logger.log('Signing out user');
    return this.adminClient.auth.admin.signOut(accessToken);
  }

  async getUser(accessToken: string): Promise<{ data: { user: unknown } | null; error: AuthError | null }> {
    return this.anonClient.auth.getUser(accessToken);
  }

  async listUsers(): Promise<{ data: { users: unknown[] } | null; error: AuthError | null }> {
    this.logger.log('Fetching registered users list');
    return this.adminClient.auth.admin.listUsers();
  }
}
