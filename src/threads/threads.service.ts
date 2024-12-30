import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateThreadDto } from 'src/threads/dtos/create-thread.dto';
import { UpdateThreadDto } from 'src/threads/dtos/update-thread.dto';
import { Thread } from 'src/threads/entities/thread.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
  ) {}
  private readonly logger = new Logger(ThreadsService.name);

  create(thread: CreateThreadDto) {
    this.threadRepository.save(thread);
  }

  findOne(id: number): Promise<Thread> {
    return this.threadRepository.findOne({
      where: { id },
    });
  }

  findAll(): Promise<Thread[]> {
    return this.threadRepository.find();
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
