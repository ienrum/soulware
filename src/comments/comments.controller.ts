import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
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
    @Param('threadId') threadId: number,
    @GetUserId() userId: number,
  ) {
    const comments = await this.commentsService.findAllForThread(threadId);

    return new CommentListResponseDto(comments, userId);
  }

  @Get(':commentId')
  async findOne(
    @Param('commentId') commentId: number,
    @GetUserId() userId: number,
  ) {
    const comment = await this.commentsService.findOne(commentId);

    return new CommentResponseDto(comment, userId);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(
    @GetUserId() userId: number,
    @Param('threadId') threadId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(userId, threadId, createCommentDto);
  }

  @UseGuards(AuthGuard)
  @Put(':commentId')
  update(
    @GetUserId() userId: number,
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(userId, commentId, updateCommentDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':commentId')
  delete(@GetUserId() userId: number, @Param('commentId') commentId: number) {
    return this.commentsService.delete(userId, commentId);
  }
}
