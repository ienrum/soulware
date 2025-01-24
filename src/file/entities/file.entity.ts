import { Thread } from 'src/threads/entities/thread.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/User.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class File extends BaseEntity {
  @Column({ length: 255, unique: true })
  name: string;

  @Column({ length: 255 })
  originalName: string;

  @Column({ length: 255 })
  path: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  threadId: number;

  @ManyToOne(() => Thread, (thread) => thread.files, {
    onDelete: 'CASCADE',
  })
  thread: Thread;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.files, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  user: Promise<User>;
}
