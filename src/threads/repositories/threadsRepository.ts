import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Thread } from 'src/threads/entities/thread.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ThreadsRepository {
  constructor(
    @InjectRepository(Thread) private threadsRepository: Repository<Thread>,
  ) {}

  async create(thread: Partial<Thread>): Promise<Thread> {
    const newThread = this.threadsRepository.create(thread);

    return this.threadsRepository.save(newThread);
  }

  async save(thread: Thread): Promise<Thread> {
    return this.threadsRepository.save(thread);
  }

  async findOneById(id: number): Promise<Thread | undefined> {
    const threads = await this.threadsRepository.query(
      `select "thread".*, json_build_object(
        'id', "u".id,
        'username', "u".name,
        'password', "u".password
      ) as "user" from "thread" inner join "user" as "u" on "thread"."user_id" = "u"."id" where "thread"."id" = ${id}`,
    );

    return this.threadsRepository.create(threads)[0];
  }

  async findForPagination(
    page: number,
    limit: number,
    search: string,
    createdAt: 'ASC' | 'DESC',
  ): Promise<Thread[]> {
    const threads = await this.threadsRepository.query(
      `
      select 
        "thread".*, 
        json_build_object(
          'id', "u".id,
          'username', "u".name,
          'password', "u".password
        ) as "user"
      from "thread" 
      inner join "user" as "u" on "thread"."user_id" = "u"."id"
      where "thread"."title" like '%${search}%'
      order by "thread"."created_at" ${createdAt} 
      limit ${limit} offset ${page * limit}
      `,
    );

    return this.threadsRepository.create(threads);
  }

  async count() {
    return this.threadsRepository.query('select count(*) from "thread"');
  }

  async update(
    id: number,
    thread: Partial<Thread>,
  ): Promise<{ affected: number }> {
    const valuesString = Object.entries(thread)
      .map(([key, value]) => {
        return `${key} = '${value}'`;
      })
      .join(', ');

    const result = await this.threadsRepository.query(
      `update "thread" set ${valuesString} where "id" = ${id} returning *`,
    );

    if (!result) {
      return { affected: 0 };
    }

    return { affected: 1 };
  }

  async delete(id: number): Promise<{ affected: number }> {
    const result = await this.threadsRepository.query(
      `delete from "thread" where "id" = ${id} returning *`,
    );

    if (!result) {
      return { affected: 0 };
    }

    return { affected: 1 };
  }
}
