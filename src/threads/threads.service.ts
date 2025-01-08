import {
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateThreadDto } from 'src/threads/dtos/create-thread.dto';
import {
  ThreadResponseDto,
  ThreadItem,
  ThreadListResponseDto,
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

  async create(userid: number, createThreadDto: CreateThreadDto) {
    const user = await this.usersService.findOne(userid);
    if (!user) {
      throw new NotFoundException(`User with id ${userid} not found`);
    }

    const thread = new Thread();
    thread.title = createThreadDto.title;
    thread.content = createThreadDto.content;
    thread.user = user;

    return await this.threadRepository.save(thread);
  }

  async findOne(id: number, authorid): Promise<ThreadResponseDto> {
    const thread = await this.threadRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!thread) {
      throw new NotFoundException(`Thread with id ${id} not found`);
    }

    const author = await this.usersService.findOne(thread.user.id);
    const authorResponse = {
      id: author.id,
      name: author.name,
    };

    const responsneDto: ThreadResponseDto = {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      author: authorResponse,
      isMyThread: thread.user.id === authorid,
    };

    return responsneDto;
  }

  async findAll(
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<ThreadListResponseDto> {
    const totalThreadsCount = await this.threadRepository.count();

    const threads = await this.threadRepository.find({
      where: { title: Like(`%${search || ''}%`) },
      take: limit || this.MAX_LIMIT,
      skip: (page - 1) * this.MAX_LIMIT || 0,
    });

    const threadItemList: ThreadItem[] = threads.map((thread) => {
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
      relations: ['user'],
    });

    if (!thread) {
      throw new NotFoundException(`Thread with id ${id} not found`);
    }

    if (thread.user.id !== authorId) {
      throw new ForbiddenException('You are not allowed to update this thread');
    }

    return await this.threadRepository.update(id, UpdateThreadDto);
  }

  async delete(id: number, authorId: number) {
    const thread = await this.threadRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!thread) {
      throw new NotFoundException(`Thread with id ${id} not found`);
    }

    if (thread.user.id !== authorId) {
      throw new ForbiddenException('You are not allowed to delete this thread');
    }

    const result = await this.threadRepository.delete(id);

    if (result.affected === 0) {
      this.logger.error(`Thread with id ${id} not found`);
    }

    return result;
  }
}
