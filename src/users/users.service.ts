import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserSignUpDto } from '../auth/dto/user-signup.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: UserSignUpDto): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findOne(idOrOptions: number | FindOptionsWhere<User>): Promise<User> {
    const userId = typeof idOrOptions === 'number' && idOrOptions;
    const options = typeof idOrOptions === 'object' && idOrOptions;

    let user: User;

    if (userId) {
      user = await this.usersRepository.findOneBy({ id: userId });
    } else if (options) {
      user = await this.usersRepository.findOneBy(options);
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
