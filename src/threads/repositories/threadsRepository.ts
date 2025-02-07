import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Thread } from 'src/threads/entities/thread.entity';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ThreadsRepository {
  constructor(
    @InjectRepository(Thread) private threadsRepository: Repository<Thread>,
  ) {}

  async create(
    thread: Partial<Thread>,
    user: User,
  ): Promise<Thread | undefined> {
    const result = await this.threadsRepository.query(
      `insert into "thread" ("title", "content", "userId") values ('${thread.title}', '${thread.content}', ${user.id}) returning *`,
    );

    return this.threadsRepository.create(result)[0];
  }

  async findOneById(id: number): Promise<Thread | undefined> {
    const threads = await this.threadsRepository.query(
      `select "thread".*, json_build_object(
        'id', "u".id,
        'name', "u".name,
        'password', "u".password
      ) as "user" from "thread" inner join "user" as "u" on "thread"."userId" = "u"."id" where "thread"."id" = ${id}`,
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
          'name', "u".name,
          'password', "u".password
        ) as "user"
      from "thread" 
      inner join "user" as "u" on "thread"."userId" = "u"."id"
      where "thread"."title" like '%${search}%'
      order by "thread"."createdAt" ${createdAt} 
      limit ${limit} offset ${(page - 1) * limit}
      `,
    );

    return this.threadsRepository.create(threads);
  }

  async count() {
    const result = await this.threadsRepository.query(
      'select count(*) from "thread"',
    );

    return parseInt(result[0].count, 10);
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
