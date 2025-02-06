import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateCommentDto } from 'src/comments/dtos/update-comment.dto';
import { ThreadsService } from '../threads/threads.service';
import { CommentsRepository } from 'src/comments/repositories/comments.repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly threadsService: ThreadsService,
    private readonly usersService: UsersService,
  ) {}

  async findAllForThread(threadId: number) {
    return await this.commentsRepository.findByThreadId(threadId, 'DESC');
  }

  async findOne(commentId: number) {
    return await this.findCommentById(commentId);
  }

  async create(
    userId: number,
    threadId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const user = await this.usersService.findOneById(userId);
    const thread = await this.threadsService.findOne(threadId);

    const comment = await this.commentsRepository.create(
      createCommentDto,
      user,
      thread,
    );

    if (!comment) {
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
    const comment = await this.commentsRepository.findOneById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    return comment;
  }
}
