import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm';
import { UserSignUpDto } from '../auth/dto/user-signup.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(signUpDto: UserSignUpDto): Promise<User> {
    const user = this.usersRepository.create(signUpDto);

    return this.usersRepository.save(user);
  }

  async findOneByName(name: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ name });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
