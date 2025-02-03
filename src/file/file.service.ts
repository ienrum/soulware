import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { File } from './entities/file.entity';
import { Thread } from 'src/threads/entities/thread.entity';
import { FileApiService } from '../file-api/file-api.service';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(Thread) private threadRepository: Repository<Thread>,
    private readonly fileApiService: FileApiService,
  ) {}
  async uploadFiles(
    files: Array<Express.Multer.File>,
    threadId: number,
    userId: number,
  ) {
    new Logger().log(JSON.stringify(files));
    if (!files) {
      throw new BadRequestException('No file uploaded');
    }

    for (const file of files) {
      this.fileApiService.checkFileExist(file.path);
    }

    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (!thread.isAuthorBy(userId)) {
      throw new BadRequestException('You are not the owner of this thread');
    }

    for (const file of files) {
      const newFile = this.fileRepository.create({
        name: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        threadId,
        userId,
      });

      const savedFile = await this.fileRepository.save(newFile);

      if (!savedFile) {
        throw new InternalServerErrorException('Failed to save file');
      }
    }
  }

  async getFiles(threadId: number) {
    return await this.fileRepository.find({
      where: {
        thread: {
          id: threadId,
        },
      },
      relations: ['thread'],
    });
  }

  async downloadFile(id: number) {
    const file = await this.fileRepository.findOne({
      where: {
        id,
      },
    });

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

    const files = await this.fileRepository.find({
      where: {
        id: In(ids),
      },
    });

    if (!files) {
      throw new NotFoundException('File not found');
    }

    const deletedFiles = this.fileApiService.deleteFiles(files);

    if (deletedFiles.length !== ids.length) {
      const deletedFilesId = deletedFiles.map((file) => file.id);
      const deletedFilesName = deletedFiles.map((file) => file.originalName);
      await this.fileRepository.delete({
        id: In(deletedFilesId),
      });

      throw new InternalServerErrorException(
        `Success to delete only ${deletedFilesName.join(', ')} files`,
      );
    }

    const result = await this.fileRepository.delete({
      id: In(ids),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
