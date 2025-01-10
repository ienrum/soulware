import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UsersService } from 'src/users/users.service';
import { Thread } from 'src/threads/entities/thread.entity';
import { UpdateCommentDto } from 'src/comments/dtos/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Thread)
    private readonly threadsRepository: Repository<Thread>,
    private readonly usersService: UsersService,
  ) {}

  async findAllForThread(threadId: number) {
    const comments = await this.commentsRepository.find({
      where: { thread: { id: threadId } },
    });

    if (!comments) {
      throw new NotFoundException(
        `Comments for thread with id ${threadId} not found`,
      );
    }
    return comments;
  }

  async findOne(commentId: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    return comment;
  }

  async create(
    userId: number,
    threadId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const thread = await this.threadsRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException(`Thread with id ${threadId} not found`);
    }

    const comment = new Comment();
    comment.content = createCommentDto.content;
    comment.user = user;
    comment.thread = thread;

    const result = this.commentsRepository.save(comment);

    if (!result) {
      throw new InternalServerErrorException('Failed to create comment');
    }

    return 'Comment created successfully';
  }

  async update(
    userId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (comment.user.id !== userId) {
      throw new NotFoundException('You are not allowed to update this comment');
    }
    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    const result = await this.commentsRepository.update(commentId, {
      content: updateCommentDto.content,
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to update comment');
    }

    return 'Comment updated successfully';
  }

  async delete(userId: number, commentId: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (comment.user.id !== userId) {
      throw new NotFoundException('You are not allowed to delete this comment');
    }
    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    const result = await this.commentsRepository.delete(commentId);

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to delete comment');
    }

    return 'Comment deleted successfully';
  }
}
