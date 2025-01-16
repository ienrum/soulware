import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUserId } from 'src/auth/decorators/get-userid.decorator';
import { FileListResponseDto } from 'src/file/dtos/file.response';
import { FileService } from 'src/file/file.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthGuard)
  @Post('upload/:threadId')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './files',
        filename: (req, file, callback) => {
          const filename = `${Date.now()}-${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
  )
  uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('threadId') threadId: number,
    @GetUserId() userId: number,
  ) {
    return this.fileService.uploadFiles(files, threadId);
  }

  @Get(':threadId')
  async getFiles(
    @Param('threadId') threadId: number,
    @GetUserId() userId: number,
  ) {
    const fileList = await this.fileService.getFiles(threadId);

    new Logger(FileController.name).log(JSON.stringify(fileList), userId);
    return new FileListResponseDto(fileList, userId);
  }

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const file = await this.fileService.downloadFile(filename);

    return response.download(file.path, file.name);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteFile(@Param('id') id: number) {
    return this.fileService.deleteFile(id);
  }

  @UseGuards(AuthGuard)
  @Post('delete')
  deleteFiles(@Body('ids') ids: number[]) {
    return this.fileService.deleteFiles(ids);
  }
}
