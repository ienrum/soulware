export class ResponseThreadItemDto {
  id: number;
  title: string;
}

export class ResponseThreadListDto {
  data: ResponseThreadItemDto[];
  totalPage: number;
}

export class ResponseThreadDto {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
  };
  isMyThread: boolean;
}
