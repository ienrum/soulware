import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateThreadDto } from 'src/threads/dtos/create-thread.dto';
import {
  ResponseThreadItemDto,
  ResponseThreadListDto,
} from 'src/threads/dtos/thread.response.dto';
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
  private readonly logger = new Logger(ThreadsService.name);
  private readonly MAX_LIMIT = 4;

  create(thread: CreateThreadDto) {
    this.threadRepository.save(thread);
  }

  findOne(id: number): Promise<Thread> {
    return this.threadRepository.findOne({
      where: { id },
    });
  }

  async findAll(
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<ResponseThreadListDto> {
    const totalThreadsCount = await this.threadRepository.count();

    const threads = await this.threadRepository.find({
      where: { title: Like(`%${search || ''}%`) },
      take: limit || this.MAX_LIMIT,
      skip: (page - 1) * this.MAX_LIMIT || 0,
    });

    const threadItemList: ResponseThreadItemDto[] = threads.map((thread) => {
      return {
        id: thread.id,
        title: thread.title,
      };
    });

    return {
      data: threadItemList,
      totalPage: Math.ceil(totalThreadsCount / (limit || this.MAX_LIMIT)),
    };
  }

  async update(id: number, UpdateThreadDto: UpdateThreadDto, authorId: number) {
    const thread = await this.threadRepository.findOne({
      where: { id },
    });

    if (!thread) {
      throw new NotFoundException(`Thread with id ${id} not found`);
    }

    if (thread.authorId !== authorId) {
      throw new HttpException('You are not allowed to update this thread', 403);
    }

    const result = await this.threadRepository.update(id, UpdateThreadDto);
    return result;
  }

  async delete(id: number, authorId: number) {
    const thread = await this.threadRepository.findOne({
      where: { id },
    });

    if (!thread) {
      throw new NotFoundException(`Thread with id ${id} not found`);
    }

    if (thread.authorId !== authorId) {
      throw new HttpException('You are not allowed to delete this thread', 403);
    }

    const result = await this.threadRepository.delete(id);

    if (result.affected === 0) {
      this.logger.error(`Thread with id ${id} not found`);
    }

    return result;
  }
}
