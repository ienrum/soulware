import { Thread } from 'src/threads/entities/thread.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ length: 255 })
  path: string;
  @Column({ length: 255 })
  url: string;

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

  @ManyToOne(() => Thread, (thread) => thread.files)
  thread: Thread;
}
