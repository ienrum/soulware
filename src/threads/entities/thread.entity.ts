import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;
}
