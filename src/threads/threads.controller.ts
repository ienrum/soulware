import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ThreadsService } from 'src/threads/threads.service';
import { CreateThreadDto } from 'src/threads/dtos/create-thread.dto';
import { UpdateThreadDto } from 'src/threads/dtos/update-thread.dto';
import { Thread } from 'src/threads/entities/thread.entity';
import { ResponseThreadListDto } from 'src/threads/dtos/thread.response.dto';
import { PaginationQuryDto } from 'src/threads/dtos/pagenation.query.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUserId } from 'src/auth/decorators/get-userid.decorator';
@Controller('threads')
export class ThreadsController {
  constructor(private threadsService: ThreadsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createThreadDto: CreateThreadDto) {
    this.threadsService.create(createThreadDto);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateThreadDto: UpdateThreadDto,
    @GetUserId() userid: number,
  ) {
    this.threadsService.update(id, updateThreadDto, userid);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQuryDto,
  ): Promise<ResponseThreadListDto> {
    return this.threadsService.findAll(query.page, query.limit, query.search);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Thread> {
    return await this.threadsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number, @GetUserId() userid: number) {
    return this.threadsService.delete(id, userid);
  }
}
