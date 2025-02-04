import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  findOne(userId: number): Promise<User> {
    const user = this.usersRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
