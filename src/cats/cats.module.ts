import { Module } from '@nestjs/common';
import { CatsController } from 'src/cats/cats.controller';
import { CatsService } from 'src/cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
