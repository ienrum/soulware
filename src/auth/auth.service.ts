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

    const user = await this.usersService.findOneByName(name);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new ForbiddenException('Invalid credentials');
    }

    const secret = this.configService.get<string>('SECRET');

    if (!secret) {
      throw new Error('No secret found');
    }

    return jwt.sign({ id: user.id }, secret, { expiresIn: '365d' });
  }
}
