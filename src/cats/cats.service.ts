import { Injectable, Logger } from '@nestjs/common';
import { Cat } from 'src/cats/interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly logger = new Logger(CatsService.name);
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findOne(name: string): Cat {
    return this.cats.find((cat) => cat.name === name);
  }

  findAll(): Cat[] {
    return this.cats;
  }

  update(name: string, UpdateCatDto: Cat) {
    const index = this.cats.findIndex((cat) => cat.name === name);
    if (index != -1) {
      this.cats[index] = UpdateCatDto;
    }

    return this.cats[index];
  }

  delete(name: string) {
    const index = this.cats.findIndex((cat) => cat.name === name);
    if (index != -1) {
      this.cats.splice(index, 1);
    }
  }
}
