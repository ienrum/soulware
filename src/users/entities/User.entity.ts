import { Thread } from 'src/threads/entities/thread.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  password: string;

  @OneToMany(() => Thread, (thread) => thread.user)
  threads: Thread[];
}
