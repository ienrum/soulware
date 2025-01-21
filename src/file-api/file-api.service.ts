import { Injectable, NotFoundException } from '@nestjs/common';

import * as fs from 'fs';
import { File } from '../file/entities/file.entity';

@Injectable()
export class FileApiService {
  checkFileExist(filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not exist');
    }
  }

  deleteFiles(files: Array<File>) {
    const deletedFiles: File[] = [];

    for (const file of files) {
      fs.unlinkSync(file.path);

      if (fs.existsSync(file.path)) {
        break;
      }

      deletedFiles.push(file);
    }

    return deletedFiles;
  }
}
