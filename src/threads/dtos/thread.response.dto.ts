export class ResponseThreadItemDto {
  id: number;
  title: string;
}

export class ResponseThreadListDto {
  data: ResponseThreadItemDto[];
  totalPage: number;
}
