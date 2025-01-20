import { Exclude, Type } from 'class-transformer';
import { Thread } from 'src/threads/entities/thread.entity';
import { User } from 'src/users/entities/User.entity';
import { Comment } from 'src/comments/entities/comment.entity';

class Author extends User {
  @Exclude()
  password: string;
  @Exclude()
  threads: Promise<Thread[]>;
  @Exclude()
  comments: Promise<Comment[]>;
  @Exclude()
  createdAt: Date;
}

export class ThreadResponseDto {
  id: number;
  title: string;
  content: string;
  isAuthor: boolean;

  @Type(() => Author)
  author: Author;
  constructor(thread: Thread, myId?: number) {
    Object.assign(this, thread);
    this.author = thread.user;
    this.isAuthor = thread.isAuthorBy(myId);
  }

  @Exclude()
  user: User;
}

export class ThreadItem extends Thread {
  @Type(() => Author)
  author: Author;

  constructor(data: Thread) {
    super();
    Object.assign(this, data);
    this.author = data.user;
  }

  @Exclude()
  user: User;
  @Exclude()
  comments: Promise<Comment[]>;
}

export class ThreadListResponseDto {
  @Type(() => ThreadItem)
  threads: ThreadItem[];
  totalPage: number;
  constructor(data: Thread[], totalPage: number) {
    this.threads = data.map((thread) => new ThreadItem(thread));
    this.totalPage = totalPage;
  }
}
