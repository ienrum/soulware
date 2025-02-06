import { Module } from '@nestjs/common';
import { ThreadsController } from 'src/threads/threads.controller';
import { ThreadsService } from 'src/threads/threads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thread } from 'src/threads/entities/thread.entity';
import { UsersModule } from 'src/users/users.module';
import { ThreadsRepository } from 'src/threads/repositories/threadsRepository';

@Module({
  imports: [TypeOrmModule.forFeature([Thread]), UsersModule],
  controllers: [ThreadsController],
  providers: [ThreadsService, ThreadsRepository],
  exports: [ThreadsService, TypeOrmModule, UsersModule, ThreadsRepository],
})
export class ThreadsModule {}
