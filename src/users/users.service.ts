import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User.entity';
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
      throw new Error('User not found');
    }

    return user;
  }
}
