import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateThreadDto } from 'src/threads/dtos/create-thread.dto';
import { UpdateThreadDto } from 'src/threads/dtos/update-thread.dto';
import { ThreadsRepository } from 'src/threads/repositories/threadsRepository';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ThreadsService {
  constructor(
    private readonly threadRepository: ThreadsRepository,
    private readonly usersService: UsersService,
  ) {}
  private readonly MAX_LIMIT = 4;

  async create(userid: number, createThreadDto: CreateThreadDto) {
    const user = await this.usersService.findOneById(userid);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.threadRepository.create(createThreadDto, user);
  }

  async findOne(id: number) {
    return await this.getById(id);
  }

  async findAll(page?: number, limit?: number, search?: string) {
    const totalThreadsCount = await this.threadRepository.count();

    const threads = await this.threadRepository.findForPagination(
      page || 1,
      limit || this.MAX_LIMIT,
      search ? search : '',
      'DESC',
    );

    const totalPage = Math.ceil(totalThreadsCount / (limit || this.MAX_LIMIT));

    return { threads, totalPage };
  }

  async update(id: number, UpdateThreadDto: UpdateThreadDto, authorId: number) {
    await this.getAndCheckIsAuthor(id, authorId);
    const result = await this.threadRepository.update(id, UpdateThreadDto);

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to update thread');
    }
  }

  async delete(id: number, authorId: number) {
    await this.getAndCheckIsAuthor(id, authorId);

    const result = await this.threadRepository.delete(id);

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to delete thread');
    }
  }

  async getAndCheckIsAuthor(threadId: number, userId?: number) {
    const thread = await this.getById(threadId);

    if (!thread.isAuthorBy(userId)) {
      throw new ForbiddenException('You are not allowed to update this thread');
    }

    return thread;
  }

  private async getById(threadId: number) {
    const thread = await this.threadRepository.findOneById(threadId);

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    return thread;
  }
}
