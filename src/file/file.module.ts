import { Module } from '@nestjs/common';
import { FileController } from 'src/file/file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/file/entities/file.entity';
import { Thread } from 'src/threads/entities/thread.entity';
import { ThreadsService } from 'src/threads/threads.service';
import { ThreadsModule } from '../threads/threads.module';

@Module({
  imports: [TypeOrmModule.forFeature([File, Thread]), ThreadsModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
