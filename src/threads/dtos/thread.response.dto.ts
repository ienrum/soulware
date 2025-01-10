import { Exclude, Type } from 'class-transformer';
import { Thread } from 'src/threads/entities/thread.entity';
import { User } from 'src/users/entities/User.entity';
import { Comment } from 'src/comments/entities/comment.entity';

class Author extends User {
  @Exclude()
  password: string;
  @Exclude()
  threads: Thread[];
  @Exclude()
  comments: Comment[];
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
  constructor(data: Thread, myId: number) {
    this.author = data.user;
    this.isAuthor = data.user.id === myId;
    Object.assign(this, data);
  }

  @Exclude()
  user: User;
}

export class ThreadItem extends Thread {
  @Type(() => Author)
  author: Author;

  constructor(data: Thread) {
    super();
    this.author = data.user;
    Object.assign(this, data);
  }

  @Exclude()
  user: User;
  @Exclude()
  comments: Comment[];
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
