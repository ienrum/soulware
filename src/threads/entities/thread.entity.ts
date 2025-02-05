import { User } from 'src/users/entities/User.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { File } from 'src/file/entities/file.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Thread extends BaseEntity {
  @Column({ length: 20, nullable: true })
  title: string;

  @Column({ length: 255, nullable: true })
  content: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @ManyToOne(() => User, (user) => user.threads, { eager: true })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.thread, { lazy: true })
  comments: Promise<Comment[]>;

  @OneToMany(() => File, (file) => file.thread, { lazy: true })
  files: Promise<File[]>;

  isAuthorBy(user?: User | number): boolean {
    const userId = user instanceof User ? user.id : user;

    return this.user.id === userId;
  }
}
