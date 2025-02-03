import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateThreadDto } from 'src/threads/dtos/create-thread.dto';
import { UpdateThreadDto } from 'src/threads/dtos/update-thread.dto';
import { Thread } from 'src/threads/entities/thread.entity';
import { UsersService } from 'src/users/users.service';
import { Like, Repository } from 'typeorm';

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
    private readonly usersService: UsersService,
  ) {}
  private readonly MAX_LIMIT = 4;

  async create(userid: number, createThreadDto: CreateThreadDto) {
    const user = await this.usersService.findOne(userid);

    const thread = this.threadRepository.create({
      ...createThreadDto,
      user,
    });

    await this.threadRepository.save(thread);
  }

  async findOne(id: number) {
    return await this.getThreadById(id);
  }

  async findAll(page?: number, limit?: number, search?: string) {
    const totalThreadsCount = await this.threadRepository.count();

    const threads = await this.threadRepository.find({
      where: { title: Like(`%${search || ''}%`) },
      take: limit || this.MAX_LIMIT,
      skip: (page - 1) * this.MAX_LIMIT || 0,
      order: { createdAt: 'DESC' },
    });

    const totalPage = Math.ceil(totalThreadsCount / (limit || this.MAX_LIMIT));

    return { threads, totalPage };
  }

  async update(id: number, UpdateThreadDto: UpdateThreadDto, authorId: number) {
    const thread = await this.getThreadById(id);

    if (!thread.isAuthorBy(authorId)) {
      throw new ForbiddenException('You are not allowed to update this thread');
    }

    await this.threadRepository.update(id, UpdateThreadDto);
  }

  async delete(id: number, authorId: number) {
    const thread = await this.getThreadById(id);

    if (!thread.isAuthorBy(authorId)) {
      throw new ForbiddenException('You are not allowed to delete this thread');
    }

    const result = await this.threadRepository.delete(id);

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to delete thread');
    }
  }

  async isAuthor(threadId: number, userId: number) {
    const thread = await this.getThreadById(threadId);

    return thread?.isAuthorBy(userId);
  }

  private async getThreadById(threadId: number) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    return thread;
  }
}
