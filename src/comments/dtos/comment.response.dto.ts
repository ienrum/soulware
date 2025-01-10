import { Exclude, Expose, Type } from 'class-transformer';
import { Comment } from 'src/comments/entities/comment.entity';
import { Thread } from 'src/threads/entities/thread.entity';
import { User } from 'src/users/entities/User.entity';

class UserResponseDto extends User {
  id: number;
  name: string;
  @Exclude()
  password: string;
  @Exclude()
  createdAt: Date;
}

class ThreadResponseDto extends Thread {}

export class CommentResponseDto {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isAuthor: boolean;

  @Expose()
  get threadId(): number {
    return this.thread.id;
  }

  constructor(comment: Comment, myId: number) {
    this.isAuthor = comment.user.id === myId;
    Object.assign(this, comment);
  }

  @Type(() => UserResponseDto)
  user: UserResponseDto;
  @Exclude()
  @Type(() => ThreadResponseDto)
  thread: ThreadResponseDto;
}

export class CommentListResponseDto {
  constructor(comments: Comment[], myId: number) {
    this.comments = comments.map(
      (comment) => new CommentResponseDto(comment, myId),
    );
  }
  @Type(() => CommentResponseDto)
  comments: CommentResponseDto[];
}
