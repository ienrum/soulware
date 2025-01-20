import { User } from 'src/users/entities/User.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { File } from 'src/file/entities/file.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, nullable: true })
  title: string;

  @Column({ length: 255, nullable: true })
  content: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.threads, { eager: true })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.thread, { lazy: true })
  comments: Promise<Comment[]>;

  @OneToMany(() => File, (file) => file.thread, { lazy: true })
  files: Promise<File[]>;
}
