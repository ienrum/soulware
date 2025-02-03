import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateCommentDto } from 'src/comments/dtos/update-comment.dto';
import { ThreadsService } from '../threads/threads.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly threadsService: ThreadsService,
    private readonly usersService: UsersService,
  ) {}

  async findAllForThread(threadId: number) {
    return await this.commentsRepository.find({
      where: { thread: { id: threadId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(commentId: number) {
    return await this.findCommentById(commentId);
  }

  async create(
    userId: number,
    threadId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const user = await this.usersService.findOne(userId);
    const thread = await this.threadsService.findOne(threadId);

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      user,
    });

    comment.thread = Promise.resolve(thread);

    const result = await this.commentsRepository.save(comment);

    if (!result) {
      throw new InternalServerErrorException('Failed to create comment');
    }
  }

  async update(
    userId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    await this.getAndCheckIsAuthor(commentId, userId);
    const result = await this.commentsRepository.update(commentId, {
      ...updateCommentDto,
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to update comment');
    }
  }

  async delete(userId: number, commentId: number) {
    await this.getAndCheckIsAuthor(commentId, userId);

    const result = await this.commentsRepository.delete(commentId);

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to delete comment');
    }
  }

  async getAndCheckIsAuthor(commentId: number, userId: number) {
    const comment = await this.findCommentById(commentId);

    if (!comment.isAuthorBy(userId)) {
      throw new NotFoundException('You are not allowed to update this comment');
    }

    return comment;
  }

  private async findCommentById(commentId: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    return comment;
  }
}
