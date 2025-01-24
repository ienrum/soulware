import { IsArray, IsInt } from 'class-validator';

export class FileDeleteDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
