import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { Thread } from 'src/threads/entities/thread.entity';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private readonly repository: Repository<Comment>,
  ) {}

  async create(comment: Partial<Comment>, user: User, thread: Thread) {
    const newComment = await this.repository.query(
      `insert into "comment" ("content", "userId", "threadId") values ('${comment.content}', ${user.id}, ${thread.id}) returning *`,
    );

    return this.repository.create(newComment)[0];
  }

  async findByThreadId(threadId: number, createdAt: 'ASC' | 'DESC') {
    const comments = await this.repository.query(
      `SELECT "comment".*, 
        json_build_object(
          'id', "u".id,
          'name', "u".name,
          'password', "u".password
        ) as "user" FROM "comment"
        inner join "user" as "u" on "comment"."userId" = "u"."id" 
        WHERE "threadId" = ${threadId} ORDER BY "createdAt" ${createdAt}`,
    );

    return this.repository.create(comments);
  }

  async findOneById(commentId: number) {
    const comment = await this.repository.query(
      `SELECT "comment".*,
        json_build_object(
          'id', "u".id,
          'name', "u".name,
          'password', "u".password
        ) as "user" FROM "comment" inner join "user" as "u"
        on "comment"."userId" = "u"."id" 
        WHERE "comment"."id" = ${commentId}`,
    );

    return this.repository.create(comment)[0];
  }

  async update(commentId: number, comment: Partial<Comment>) {
    const setValuesString = Object.entries(comment)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ');

    const result = await this.repository.query(
      `update "comment" set ${setValuesString} where "id" = ${commentId} returning *`,
    );

    return { affected: result[1] };
  }

  async delete(commentId: number) {
    const result = await this.repository.query(
      `delete from "comment" where "id" = ${commentId}`,
    );

    return { affected: result[1] };
  }
}
