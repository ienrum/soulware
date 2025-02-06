import { Thread } from 'src/threads/entities/thread.entity';
import { Comment } from 'src/comments/entities/comment.entity';

import { Column, Entity, OneToMany } from 'typeorm';
import { File } from '../../file/entities/file.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true, length: 20 })
  name: string;

  @Column({ length: 255 })
  password: string;

  @OneToMany(() => Thread, (thread) => thread.user, { lazy: true })
  threads: Promise<Thread[]>;

  @OneToMany(() => Comment, (comment) => comment.user, { lazy: true })
  comments: Promise<Comment[]>;

  @OneToMany(() => File, (file) => file.thread, { lazy: true })
  files: Promise<File[]>;
}
