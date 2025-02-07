import { Permission } from 'src/auth/entities/permission.entity';
import { User } from 'src/users/entities/User.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable()
  permissions: Permission[];
}
