import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/User.entity';
import { UserSignUpDto } from '../auth/dto/user-signup.dto';
import { UsersRepository } from 'src/users/repositories/usersRepository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(signUpDto: UserSignUpDto): Promise<User> {
    const user = await this.usersRepository.findByOneName(signUpDto.name);

    if (user) {
      throw new ConflictException('User already exists');
    }

    return this.usersRepository.create(signUpDto);
  }

  async findOneByName(name: string): Promise<User> {
    const user = await this.usersRepository.findByOneName(name);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findByOneId(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
