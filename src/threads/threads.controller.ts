import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ThreadsService } from 'src/threads/threads.service';
import { CreateThreadDto } from 'src/threads/dtos/create-thread.dto';
import { UpdateThreadDto } from 'src/threads/dtos/update-thread.dto';
import {
  ThreadResponseDto,
  ThreadListResponseDto,
} from 'src/threads/dtos/thread.response.dto';
import { PaginationQuryDto } from 'src/threads/dtos/pagenation.query.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUserId } from 'src/auth/decorators/get-userid.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('threads')
export class ThreadsController {
  constructor(private threadsService: ThreadsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @GetUserId() userid: number,
    @Body() createThreadDto: CreateThreadDto,
  ) {
    return this.threadsService.create(userid, createThreadDto);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateThreadDto: UpdateThreadDto,
    @GetUserId() userid: number,
  ) {
    return this.threadsService.update(id, updateThreadDto, userid);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQuryDto,
  ): Promise<ThreadListResponseDto> {
    return this.threadsService.findAll(query.page, query.limit, query.search);
  }

  @Get(':id')
  findOne(
    @Param('id') id: number,
    @GetUserId() userid: number,
  ): Promise<ThreadResponseDto> {
    return this.threadsService.findOne(id, userid);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number, @GetUserId() userid: number) {
    return this.threadsService.delete(id, userid);
  }
}
