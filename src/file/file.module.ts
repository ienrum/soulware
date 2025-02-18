import { Module } from '@nestjs/common';
import { FileController } from 'src/file/file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/file/entities/file.entity';
import { ThreadsModule } from '../threads/threads.module';
import { FileApiService } from '../file-api/file-api.service';
import { UsersModule } from '../users/users.module';
import { FileRepository } from 'src/file/repositories/fileRepository';

@Module({
  imports: [TypeOrmModule.forFeature([File]), ThreadsModule, UsersModule],
  controllers: [FileController],
  providers: [FileService, FileApiService, FileRepository],
})
export class FileModule {}
