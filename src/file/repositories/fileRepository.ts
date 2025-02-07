import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from 'src/file/entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async create(file: Partial<File>, userId: number, threadId: number) {
    const newFile = await this.fileRepository.query(
      `insert into "file" ("name", "originalName", "path", "size", "userId", "threadId") values ('${file.name}', '${file.originalName}', '${file.path}', ${file.size}, ${userId}, ${threadId}) returning *`,
    );

    return this.fileRepository.create(newFile)[0];
  }

  async findByThreadId(threadId: number) {
    const files = await this.fileRepository.query(
      `
      select "file".*, json_build_object(
        'id', "thread".id,
        'title', "thread".title,
        'content', "thread".content,
        'createdAt', "thread"."createdAt",
        'updatedAt', "thread"."updatedAt",
        'viewCount', "thread"."viewCount"
      ) as "thread"
      from "file" inner join "thread" on "thread"."id" = "file"."threadId"
      where "thread"."id" = ${threadId}`,
    );

    return this.fileRepository.create(files);
  }

  async findOneById(id: number) {
    const file = await this.fileRepository.query(
      `select * from "file" where id = ${id}`,
    );

    return this.fileRepository.create(file)[0];
  }

  async findByIds(ids: number[]) {
    const files = await this.fileRepository.query(
      `select * from "file" where id in (${ids.join(',')})`,
    );

    return this.fileRepository.create(files);
  }

  async deleteByIds(ids: number[]) {
    const result = await this.fileRepository.query(
      `delete from "file" where id in (${ids.join(',')}) returning *`,
    );

    if (result[1] !== ids.length) {
      return { affected: 0 };
    }

    return { affected: result[1] };
  }
}
