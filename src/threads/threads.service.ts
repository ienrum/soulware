import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateThreadDto } from 'src/threads/dtos/create-thread.dto';
import {
  ResponseThreadItemDto,
  ResponseThreadListDto,
} from 'src/threads/dtos/thread.response.dto';
import { UpdateThreadDto } from 'src/threads/dtos/update-thread.dto';
import { Thread } from 'src/threads/entities/thread.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
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

  async update(id: number, UpdateThreadDto: UpdateThreadDto) {
    this.logger.log(
      `Updating thread with id ${id}` + JSON.stringify(UpdateThreadDto),
    );
    const result = await this.threadRepository.update(id, UpdateThreadDto);
    return result;
  }

  async delete(name: string) {
    const result = await this.threadRepository.delete(name);

    if (result.affected === 0) {
      this.logger.error(`Thread with name ${name} not found`);
    }

    return result;
  }
}
