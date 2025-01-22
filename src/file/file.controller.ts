import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUserId } from 'src/auth/decorators/get-userid.decorator';
import { FileListResponseDto } from 'src/file/dtos/file.response';
import { FileService } from 'src/file/file.service';

import { v4 } from 'uuid';
import { ThreadsService } from '../threads/threads.service';
import { FileDeleteDto } from './dtos/file-delete.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly threadsService: ThreadsService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('upload/:threadId')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './files',
        filename: (req, file, callback) => {
          file.originalname = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );
          const filename = `${v4()}-${file.originalname}`;
          callback(null, filename);
        },
      }),
      limits: {
        files: 10,
        fileSize: 1000000,
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @Param('threadId', ParseIntPipe) threadId: number,
    @GetUserId() userId: number,
  ) {
    await this.fileService.uploadFiles(files, threadId, userId);

    return 'File uploaded successfully';
  }

  @Get(':threadId')
  async getFiles(
    @Param('threadId', ParseIntPipe) threadId: number,
    @GetUserId() userId: number,
  ) {
    const fileList = await this.fileService.getFiles(threadId);
    const isAuthor = await this.threadsService.isAuthor(threadId, userId);

    return new FileListResponseDto(fileList, isAuthor);
  }

  @Get('download/:id')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    const file = await this.fileService.downloadFile(id);

    return response.download(file.path, file.name);
  }

  @UseGuards(AuthGuard)
  @Post(':threadId/delete')
  async deleteFiles(
    @Param('threadId', ParseIntPipe) threadId: number,
    @GetUserId() userId: number,
    @Body() dto: FileDeleteDto,
  ) {
    const isAuthor = await this.threadsService.isAuthor(threadId, userId);

    if (!isAuthor) {
      throw new ForbiddenException('You are not the owner of this thread');
    }

    await this.fileService.deleteFiles(dto.ids);

    return 'Files deleted successfully';
  }
}
