import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSignUpDto } from 'src/auth/dto/user-signup.dto';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async create(userSignUpDto: UserSignUpDto): Promise<User | undefined> {
    const result = await this.repository.query(
      `insert into "user" ("name", "password") values ('${userSignUpDto.name}', '${userSignUpDto.password}') returning *`,
    );

    return this.repository.create(result)[0];
  }

  async findByOneName(name: string): Promise<User> {
    const user = await this.repository.query(
      `select * from "user" where "name" = '${name}'`,
    );

    return user[0];
  }

  async findByOneId(id: number): Promise<User> {
    const user = await this.repository.query(
      `select * from "user" where "id" = '${id}'`,
    );

    return user[0];
  }
}
