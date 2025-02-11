import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/User.entity';
import { UserSignUpDto } from '../auth/dto/user-signup.dto';
import { UsersRepository } from 'src/users/repositories/usersRepository';
import { Role } from 'src/auth/decorators/Roles.decorator';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(signUpDto: UserSignUpDto): Promise<User> {
    const user = await this.usersRepository.findByOneName(signUpDto.name);

    if (user) {
      throw new ConflictException('User already exists');
    }

    const newUser = await this.usersRepository.create(signUpDto, [Role.Buyer]);

    if (!newUser) {
      throw new ConflictException('Failed to create user');
    }

    return newUser;
  }

  async findOneByName(name: string) {
    const userInfo = await this.usersRepository.findByOneName(name);

    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    return userInfo;
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findByOneId(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
