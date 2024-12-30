import { Module } from '@nestjs/common';
import { ThreadsController } from 'src/threads/threads.controller';
import { ThreadsService } from 'src/threads/threads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thread } from 'src/threads/entities/thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Thread])],
  controllers: [ThreadsController],
  providers: [ThreadsService],
  exports: [ThreadsService],
})
export class ThreadsModule {}
