import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Redirect,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ThreadsService } from 'src/threads/threads.service';
import { CreateThreadDto } from 'src/threads/dtos/create-thread.dto';
import { GetDocsQueryList } from 'src/threads/dtos/query-docs';
import { UpdateThreadDto } from 'src/threads/dtos/update-thread.dto';
import { Thread } from 'src/threads/entities/thread.entity';
import { ResponseThreadItemDto } from 'src/threads/dtos/thread.response.dto';
@Controller('threads')
export class ThreadsController {
  constructor(private threadsService: ThreadsService) {}

  @Post()
  create(@Body() createThreadDto: CreateThreadDto) {
    this.threadsService.create(createThreadDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateThreadDto: UpdateThreadDto) {
    this.threadsService.update(id, updateThreadDto);
  }

  @Get()
  async findAll(): Promise<ResponseThreadItemDto[]> {
    return this.threadsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Thread> {
    return await this.threadsService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.threadsService.delete(id);
  }
}
