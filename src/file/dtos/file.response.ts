import { Exclude, Expose, Type } from 'class-transformer';
import { File } from 'src/file/entities/file.entity';
import { Thread } from 'src/threads/entities/thread.entity';
import { User } from '../../users/entities/User.entity';

class FileResponseDto extends File {
  id: number;
  name: string;
  originalName: string;
  isAuthor: boolean;

  @Expose()
  url: string;
  size: number;
  @Exclude()
  path: string;
  @Exclude()
  @Type(() => Thread)
  thread: Thread;
  @Exclude()
  userId: number;

  constructor(file: File, userId: number) {
    super();
    Object.assign(this, file);
    this.isAuthor = this.userId === userId;
    this.url = `${process.env.APP_URL}/file/download/${file.id}`;
  }
}

export class FileListResponseDto {
  constructor(files: File[], userId: number) {
    this.files = files.map((file) => new FileResponseDto(file, userId));
    this.isAuthor = this.files.every((file) => file.isAuthor);
  }

  isAuthor: boolean;
  @Type(() => FileResponseDto)
  files: FileResponseDto[];
}
