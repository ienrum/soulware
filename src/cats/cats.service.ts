import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCatDto } from 'src/cats/dtos/create-cat.dto';
import { UpdateCatDto } from 'src/cats/dtos/update-cat.dto';
import { Cat } from 'src/cats/entities/cat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) {}
  private readonly logger = new Logger(CatsService.name);

  create(cat: CreateCatDto) {
    this.catRepository.save(cat);
  }

  findOne(id: number): Promise<Cat> {
    return this.catRepository.findOne({
      where: { id },
    });
  }

  findAll(): Promise<Cat[]> {
    return this.catRepository.find();
  }

  async update(id: number, UpdateCatDto: UpdateCatDto) {
    this.logger.log(
      `Updating cat with id ${id}` + JSON.stringify(UpdateCatDto),
    );
    const result = await this.catRepository.update(id, UpdateCatDto);
    return result;
  }

  async delete(name: string) {
    const result = await this.catRepository.delete(name);

    if (result.affected === 0) {
      this.logger.error(`Cat with name ${name} not found`);
    }

    return result;
  }
}
