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
}

export class ThreadResponseDto {
  id: number;
  title: string;
  content: string;
  isAuthor: boolean;

  @Type(() => Author)
  user: Author;

  constructor(data: Thread, myId: number) {
    this.isAuthor = data.user.id === myId;
    Object.assign(this, data);
  }
}

export class ThreadItem extends Thread {
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
    this.threads = data;
    this.totalPage = totalPage;
  }
}
