import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { File } from './entities/file.entity';
import { Thread } from 'src/threads/entities/thread.entity';

import * as fs from 'fs';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(Thread) private threadRepository: Repository<Thread>,
  ) {}
  async uploadFiles(
    files: Array<Express.Multer.File>,
    threadId: number,
    userId: number,
  ) {
    if (!files) {
      throw new BadRequestException('No file uploaded');
    }

    for (const file of files) {
      if (!fs.existsSync(file.path)) {
        throw new NotFoundException('File not exist');
      }
    }

    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.user.id !== userId) {
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
    const files = await this.fileRepository.find({
      where: {
        thread: {
          id: threadId,
        },
      },
    });

    if (!files) {
      throw new NotFoundException('Files not found');
    }

    return files;
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

    if (!fs.existsSync(file.path)) {
      throw new NotFoundException('File not found');
    }

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

    const deletedFiles: File[] = [];

    for (const file of files) {
      fs.unlinkSync(file.path);

      if (fs.existsSync(file.path)) {
        break;
      }

      deletedFiles.push(file);
    }

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

    return 'File deleted successfully';
  }
}
