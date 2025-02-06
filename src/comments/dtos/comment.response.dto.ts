import { Exclude, Type } from 'class-transformer';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/User.entity';

class UserResponseDto extends User {
  id: number;
  name: string;
  @Exclude()
  password: string;
  @Exclude()
  createdAt: Date;
}

export class CommentResponseDto {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isAuthor: boolean;
  constructor(comment: Comment, myId?: number) {
    this.isAuthor = comment.isAuthorBy(myId);
    this.createdAt = comment['createdAt'];
    Object.assign(this, comment);
  }

  @Type(() => UserResponseDto)
  user: UserResponseDto;
}

export class CommentListResponseDto {
  constructor(comments: Comment[], myId?: number) {
    this.comments = comments.map(
      (comment) => new CommentResponseDto(comment, myId),
    );
  }
  @Type(() => CommentResponseDto)
  comments: CommentResponseDto[];
}
