import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { UsersModule } from 'src/users/users.module';
import { ThreadsModule } from '../threads/threads.module';
import { CommentsRepository } from 'src/comments/repositories/comments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), UsersModule, ThreadsModule],
  providers: [CommentsService, CommentsRepository],
  controllers: [CommentsController],
  exports: [
    CommentsService,
    TypeOrmModule,
    UsersModule,
    ThreadsModule,
    CommentsRepository,
  ],
})
export class CommentsModule {}
