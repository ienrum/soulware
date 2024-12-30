import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
  @Column()
  content: string;

  @Column()
  author: string;
}
