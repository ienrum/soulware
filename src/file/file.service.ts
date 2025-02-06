import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { FileApiService } from '../file-api/file-api.service';
import { ThreadsService } from '../threads/threads.service';
import { FileRepository } from 'src/file/repositories/fileRepository';

@Injectable()
export class FileService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly threadsService: ThreadsService,
    private readonly fileApiService: FileApiService,
  ) {}
  async uploadFiles(
    files: Array<Express.Multer.File>,
    threadId: number,
    userId: number,
  ) {
    new Logger().log(JSON.stringify(files));
    if (files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }

    for (const file of files) {
      this.fileApiService.checkFileExist(file.path);
    }

    const thread = await this.threadsService.findOne(threadId);

    if (!thread.isAuthorBy(userId)) {
      throw new BadRequestException('You are not the owner of this thread');
    }

    for (const file of files) {
      const savedFile = await this.fileRepository.create(
        {
          name: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
        },
        userId,
        threadId,
      );

      if (!savedFile) {
        throw new InternalServerErrorException('Failed to save file');
      }
    }
  }

  async getFiles(threadId: number) {
    return await this.fileRepository.findByThreadId(threadId);
  }

  async getAndCheckFileExist(id: number) {
    const file = await this.fileRepository.findOneById(id);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    this.fileApiService.checkFileExist(file.path);

    return file;
  }

  async deleteFiles(ids: number[]) {
    if (ids.length === 0) {
      throw new BadRequestException('ids are empty');
    }

    const files = await this.fileRepository.findByIds(ids);

    if (files.length === 0) {
      throw new NotFoundException('File not found');
    }

    const deletedFiles = this.fileApiService.deleteFiles(files);

    if (deletedFiles.length !== ids.length) {
      const deletedFilesId = deletedFiles.map((file) => file.id);
      const deletedFilesName = deletedFiles.map((file) => file.originalName);
      const result = await this.fileRepository.deleteByIds(deletedFilesId);

      if (result.affected === 0) {
        throw new InternalServerErrorException(
          `Failed to delete ${deletedFilesName.join(', ')} files`,
        );
      }

      throw new InternalServerErrorException(
        `Success to delete only ${deletedFilesName.join(', ')} files`,
      );
    }

    const result = await this.fileRepository.deleteByIds(ids);

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
