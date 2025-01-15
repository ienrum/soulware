import { Exclude, Type } from 'class-transformer';
import { File } from 'src/file/entities/file.entity';
import { Thread } from 'src/threads/entities/thread.entity';

export class FileResponseDto extends File {
  id: number;
  name: string;
  url: string;
  size: number;
  @Exclude()
  path: string;
  @Exclude()
  @Type(() => Thread)
  thread: Thread;

  constructor(file: File) {
    super();
    this.id = file.id;
    this.name = file.name;
    this.size = file.size;
    this.url = file.url;
  }
}
