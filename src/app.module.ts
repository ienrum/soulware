import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThreadsModule } from './threads/threads.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thread } from 'src/threads/entities/thread.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from 'src/users/entities/User.entity';
import { AuthModule } from './auth/auth.module';
import { APP_PIPE } from '@nestjs/core';
import { CommentsModule } from './comments/comments.module';
import { Comment } from 'src/comments/entities/comment.entity';
import { FileModule } from './file/file.module';
import { File } from 'src/file/entities/file.entity';
import { FileApiService } from './file-api/file-api.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: true,
      logging: true,
      entities: [Thread, User, Comment, File],
    }),
    ThreadsModule,
    UsersModule,
    AuthModule,
    CommentsModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    FileApiService,
  ],
})
export class AppModule {}
