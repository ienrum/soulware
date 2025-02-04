import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { SaltRoundsProvider } from './providers/providers';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, SaltRoundsProvider],
  exports: [AuthService],
})
export class AuthModule {}
