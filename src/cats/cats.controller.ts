import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Redirect,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CatsService } from 'src/cats/cats.service';
import { CreateCatDto } from 'src/cats/dtos/create-cat.dto';
import { GetDocsQueryList } from 'src/cats/dtos/query-docs';
import { UpdateCatDto } from 'src/cats/dtos/update-cat.dto';
import { Cat } from 'src/cats/interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    this.catsService.update(id, updateCatDto);
  }

  @Get()
  async findAll(@Req() request: Request): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Cat> {
    return this.catsService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.catsService.delete(id);
  }

  @Get('docs')
  @Redirect('https://docs.nest.com', 302)
  getDocs(@Query() query: GetDocsQueryList) {
    if (query.version && query.version == '5') {
      return { url: `https://docs.nestjs.com/v5/?name=${query.name}` };
    }
  }
}
