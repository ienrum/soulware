import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserSignUpDto } from './dto/user-signup.dto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserSignInDto } from 'src/auth/dto/user-signin.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SALT_ROUNDS_TOKEN } from '../common/constants';
import { User } from 'src/users/entities/User.entity';
import { StringValue } from 'ms';

interface TokenPayload {
  id: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    @Inject(SALT_ROUNDS_TOKEN) private readonly salt_rounds: number,
  ) {}
  async signUp(userSignUpDto: UserSignUpDto) {
    const { password, ...userData } = userSignUpDto;
    const hashedPassword = await bcrypt.hash(password, this.salt_rounds);

    const signupDto = {
      ...userData,
      password: hashedPassword,
    };

    await this.usersService.create(signupDto);
  }

  async signIn(userSignInDto: UserSignInDto) {
    const { name, password } = userSignInDto;

    const userInfo = await this.usersService.findOneByName(name);
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      userInfo.user.password,
    );
    if (!isPasswordCorrect) {
      throw new ForbiddenException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(userInfo.user);
    const refreshToken = this.generateRefreshToken(userInfo.user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken?: string) {
    const secret = this.configService.get<string>('SECRET');

    if (!secret) {
      throw new ForbiddenException('Secret key not defined');
    }

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token not provided');
    }

    try {
      const payload: TokenPayload = jwt.verify(
        refreshToken,
        secret,
      ) as TokenPayload;
      const user = await this.usersService.findOneById(payload.id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.generateAccessToken(user);
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  private generateAccessToken(user: User) {
    const secret = this.configService.get<string>('SECRET');
    const accessTokenExpiry = this.configService.get<StringValue>(
      'ACCESS_TOKEN_EXPIRY',
    );

    if (!secret || !accessTokenExpiry) {
      throw new ForbiddenException('Secret key not defined');
    }

    return jwt.sign({ id: user.id }, secret, { expiresIn: accessTokenExpiry });
  }

  private generateRefreshToken(user: User) {
    const secret = this.configService.get<string>('SECRET');
    const refreshTokenExpiry = this.configService.get<StringValue>(
      'REFRESH_TOKEN_EXPIRY',
    );

    if (!secret || !refreshTokenExpiry) {
      throw new ForbiddenException('Secret key not defined');
    }

    return jwt.sign({ id: user.id }, secret, { expiresIn: refreshTokenExpiry });
  }
}
