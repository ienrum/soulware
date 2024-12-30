import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 'unknown' })
  breed: string;
}
