import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/auth/decorators/Roles.decorator';
import { UserSignUpDto } from 'src/auth/dto/user-signup.dto';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}
  async create(
    userSignUpDto: UserSignUpDto,
    defaultRoles: Role[],
  ): Promise<User | undefined> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rolesResult = await queryRunner.query(
        `select id from "role" where "name" in ('${defaultRoles.join("','")}')`,
      );

      const result = await queryRunner.query(
        `insert into "user" ("name", "password") values ('${userSignUpDto.name}', '${userSignUpDto.password}') returning *`,
      );
      const user = result[0];

      for (const role of rolesResult) {
        await queryRunner.query(
          `insert into "user_roles_role" ("userId", "roleId") values (${user.id}, ${role.id})`,
        );
      }

      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByOneName(name: string) {
    const roleNamesByUser = await this.repository.query(
      `select 
        array_agg("role"."name") as roles
      from "user"
      left join "user_roles_role" on "user"."id" = "user_roles_role"."userId"
      left join "role" on "role"."id" = "user_roles_role"."roleId"
      where "user"."name" = '${name}'`,
    );

    const user = await this.repository.query(
      `select * from "user" where "name" = '${name}'`,
    );

    return { user: user[0], roles: roleNamesByUser[0] };
  }

  async findByOneId(id: number): Promise<User> {
    const user = await this.repository.query(
      `select * from "user" where "id" = '${id}'`,
    );

    return user[0];
  }
}
