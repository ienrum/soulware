import { Thread } from 'src/threads/entities/thread.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  name: string;

  @Column({ length: 255 })
  password: string;
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => Thread, (thread) => thread.user, { lazy: true })
  threads: Promise<Thread[]>;

  @OneToMany(() => Comment, (comment) => comment.user, { lazy: true })
  comments: Promise<Comment[]>;
}
