import { Module } from '@nestjs/common';
import { FileController } from 'src/file/file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/file/entities/file.entity';
import { Thread } from 'src/threads/entities/thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File, Thread])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
