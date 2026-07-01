import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Logger,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { successResponse } from '../../common/utils/response.util';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { LoginResponse, AuthUser } from '../interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<LoginResponse>> {
    this.logger.log(`Registration request received for email: ${registerDto.email}`);
    const result = await this.authService.register(registerDto);
    return successResponse('Registration successful', result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    this.logger.log(`Login request received for email: ${loginDto.email}`);
    const result = await this.authService.login(loginDto);
    return successResponse('Login successful', result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: ExpressRequest & { user: AuthUser },
  ): Promise<ApiResponse> {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await this.authService.logout(token);
    }
    return successResponse('Logout successful');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Request() req: ExpressRequest & { user: AuthUser },
  ): Promise<ApiResponse<AuthUser>> {
    return successResponse('Profile retrieved successfully', req.user);
  }
}
