import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User.entity';
import { UsersRepository } from 'src/users/repositories/usersRepository';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
