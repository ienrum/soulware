import { Exclude, Expose, Type } from 'class-transformer';
import { File } from 'src/file/entities/file.entity';
import { Thread } from 'src/threads/entities/thread.entity';

class FileResponseDto extends File {
  id: number;
  name: string;
  originalName: string;

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

  constructor(file: File) {
    super();
    Object.assign(this, file);
    this.url = `${process.env.APP_URL}/file/download/${file.id}`;
  }
}

export class FileListResponseDto {
  constructor(files: File[], isAuthor: boolean) {
    this.files = files.map((file) => new FileResponseDto(file));
    this.isAuthor = isAuthor;
  }

  isAuthor: boolean;
  @Type(() => FileResponseDto)
  files: FileResponseDto[];
}
