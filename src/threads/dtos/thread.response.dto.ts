import { Expose } from 'class-transformer';

export class ThreadItem {
  @Expose()
  id: number;

  @Expose()
  title: string;
}

export class ThreadListResponseDto {
  @Expose()
  data: ThreadItem[];
  @Expose()
  totalPage: number;
}

export class ThreadResponseDto {
  @Expose()
  id: number;
  @Expose()
  title: string;
  @Expose()
  content: string;
  @Expose()
  author: {
    id: number;
    name: string;
  };
  @Expose()
  isMyThread: boolean;
}
