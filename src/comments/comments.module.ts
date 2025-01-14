import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Thread } from 'src/threads/entities/thread.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Thread]), UsersModule],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
