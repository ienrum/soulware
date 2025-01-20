import { Thread } from 'src/threads/entities/thread.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/User.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ length: 255 })
  originalName: string;

  @Column({ length: 255 })
  path: string;

  @Column()
  size: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

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
