import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from 'src/comments/dtos/create-comment.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUserId } from 'src/auth/decorators/get-userid.decorator';
import { UpdateCommentDto } from 'src/comments/dtos/update-comment.dto';
import {
  CommentListResponseDto,
  CommentResponseDto,
} from 'src/comments/dtos/comment.response.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('threads/:threadId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  async findAllForThread(
    @Param('threadId', ParseIntPipe) threadId: number,
    @GetUserId() userId?: number,
  ) {
    const comments = await this.commentsService.findAllForThread(threadId);

    return new CommentListResponseDto(comments, userId);
  }

  @Get(':commentId')
  async findOne(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUserId() userId?: number,
  ) {
    const comment = await this.commentsService.findOne(commentId);

    return new CommentResponseDto(comment, userId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Param('threadId', ParseIntPipe) threadId: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUserId() userId: number,
  ) {
    await this.commentsService.create(userId, threadId, createCommentDto);

    return 'Comment created successfully';
  }

  @UseGuards(AuthGuard)
  @Put(':commentId')
  async update(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUserId() userId: number,
  ) {
    await this.commentsService.update(userId, commentId, updateCommentDto);

    return 'Comment updated successfully';
  }

  @UseGuards(AuthGuard)
  @Delete(':commentId')
  async delete(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUserId() userId: number,
  ) {
    await this.commentsService.delete(userId, commentId);

    return 'Comment deleted successfully';
  }
}
