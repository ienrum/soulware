import { Expose } from 'class-transformer';

export class ResponseThreadItemDto {
  @Expose()
  id: number;

  @Expose()
  title: string;
}

export class ResponseThreadListDto {
  @Expose()
  data: ResponseThreadItemDto[];
  @Expose()
  totalPage: number;
}

export class ResponseThreadDto {
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
