import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsersService } from '@modules/users/users.service';
import { User } from '@modules/users/entities/user.entity';
import { LoginDto, RegisterDto, TokenResponseDto } from './dto/auth.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto, metadata?: RequestMetadata): Promise<TokenResponseDto> {
    const user = await this.usersService.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    await this.usersService.updateLastLogin(user.id);

    return this.generateTokens(user, metadata);
  }

  async refreshTokens(refreshToken: string, metadata?: RequestMetadata): Promise<TokenResponseDto> {
    const tokenHash = await this.hashToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.isRevoked) {
      // Token reuse detected - revoke entire family
      this.logger.warn(`Refresh token reuse detected for user ${storedToken.userId}`);
      await this.revokeTokenFamily(storedToken.family);
      throw new UnauthorizedException('Token reuse detected. Please login again.');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Revoke the used token
    await this.refreshTokenRepository.update(storedToken.id, { isRevoked: true });

    // Generate new tokens with same family
    return this.generateTokens(storedToken.user, metadata, storedToken.family);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = await this.hashToken(refreshToken);
      await this.refreshTokenRepository.update({ tokenHash }, { isRevoked: true });
    } else {
      // Revoke all tokens for user
      await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
  }

  private async generateTokens(
    user: User,
    metadata?: RequestMetadata,
    existingFamily?: string,
  ): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const family = existingFamily || uuidv4();

    // Calculate expiration
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    const expiresAt = this.calculateExpiration(refreshExpiration);

    // Hash and store refresh token
    const tokenHash = await this.hashToken(refreshToken);

    await this.refreshTokenRepository.save({
      userId: user.id,
      tokenHash,
      family,
      expiresAt,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent?.substring(0, 500),
    });

    // Get access token expiration in seconds
    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m');
    const expiresIn = this.parseExpirationToSeconds(accessExpiration);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  private async revokeTokenFamily(family: string): Promise<void> {
    await this.refreshTokenRepository.update({ family }, { isRevoked: true });
  }

  private calculateExpiration(duration: string): Date {
    const seconds = this.parseExpirationToSeconds(duration);
    return new Date(Date.now() + seconds * 1000);
  }

  private parseExpirationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
