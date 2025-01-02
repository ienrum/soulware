import { HttpException, Injectable } from '@nestjs/common';
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
      throw new HttpException('User already exists', 400);
    }

    return { message: 'User created successfully' };
  }

  async signIn(userSignInDto: UserSignInDto) {
    const { name, password } = userSignInDto;

    const user = await this.usersRepository.findOne({ where: { name } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new HttpException('Invalid credentials', 401);
    }

    const secret = this.configService.get<string>('SECRET');

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '365d' });

    return token;
  }
}
