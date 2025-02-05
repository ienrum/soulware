import { Thread } from 'src/threads/entities/thread.entity';
import { User } from 'src/users/entities/User.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Comment extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.comments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Thread, (thread) => thread.comments, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  thread: Promise<Thread>;

  isAuthorBy(user: User | number | undefined): boolean {
    const userId = user instanceof User ? user.id : user;

    return this.user.id === userId;
  }
}
