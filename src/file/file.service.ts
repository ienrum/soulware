import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { File } from './entities/file.entity';
import { Thread } from 'src/threads/entities/thread.entity';

import * as fs from 'fs';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(Thread) private threadRepository: Repository<Thread>,
  ) {}
  async uploadFiles(files: Array<Express.Multer.File>, threadId: number) {
    if (!files) {
      throw new BadRequestException('No file uploaded');
    }

    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      relations: ['files'],
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    const threadFiles = await thread.files;

    for (const file of files) {
      const newFile = this.fileRepository.create({
        name: file.filename,
        path: file.path,
        size: file.size,
        url: `http://localhost:3000/file/download/${file.filename}`,
      });
      newFile.threadId = threadId;

      const savedFile = await this.fileRepository.save(newFile);

      if (!savedFile) {
        throw new InternalServerErrorException('Failed to save file');
      }

      threadFiles.push(newFile);
    }

    await this.threadRepository.save(thread);

    return 'File uploaded successfully';
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

  async downloadFile(filename: string) {
    const file = await this.fileRepository.findOne({
      where: {
        name: filename,
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
}
