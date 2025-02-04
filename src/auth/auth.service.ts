import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserSignUpDto } from './dto/user-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserSignInDto } from 'src/auth/dto/user-signin.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}
  async signUp(userSignUpDto: UserSignUpDto) {
    const { password, ...userData } = userSignUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await this.usersRepository.save({
        ...userData,
        password: hashedPassword,
      });
    } catch (error) {
      throw new ConflictException('User already exists');
    }
  }

  async signIn(userSignInDto: UserSignInDto) {
    const { name, password } = userSignInDto;

    const user = await this.usersRepository.findOne({ where: { name } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new ForbiddenException('Invalid credentials');
    }

    const secret = this.configService.get<string>('SECRET');

    return jwt.sign({ id: user.id }, secret, { expiresIn: '365d' });
  }
}
