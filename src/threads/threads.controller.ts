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
  async create(
    @GetUserId() userid: number,
    @Body() createThreadDto: CreateThreadDto,
  ) {
    await this.threadsService.create(userid, createThreadDto);

    return 'Thread created successfully';
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateThreadDto: UpdateThreadDto,
    @GetUserId() userid: number,
  ) {
    await this.threadsService.update(id, updateThreadDto, userid);

    return 'Thread updated successfully';
  }

  @Get()
  async findAll(
    @Query() query: PaginationQuryDto,
  ): Promise<ThreadListResponseDto> {
    const { threads, totalPage } = await this.threadsService.findAll(
      query.page,
      query.limit,
      query.search,
    );

    return new ThreadListResponseDto(threads, totalPage);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @GetUserId() userid: number,
  ): Promise<ThreadResponseDto> {
    const thread = await this.threadsService.findOne(id);

    return new ThreadResponseDto(thread, userid);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number, @GetUserId() userid: number) {
    await this.threadsService.delete(id, userid);

    return 'Thread deleted successfully';
  }
}
