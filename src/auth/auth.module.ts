import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { SaltRoundsProvider } from './providers/providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/auth/entities/role.entity';
import { Permission } from 'src/auth/entities/permission.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Role, Permission])],
  controllers: [AuthController],
  providers: [AuthService, SaltRoundsProvider],
  exports: [AuthService],
})
export class AuthModule {}
