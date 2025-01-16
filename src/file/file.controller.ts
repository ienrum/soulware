import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FileService } from 'src/file/file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

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
  ) {
    return this.fileService.uploadFiles(files, threadId);
  }

  @Get(':threadId')
  getFiles(@Param('threadId') threadId: number) {
    return this.fileService.getFiles(threadId);
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
