import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/User.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;

  const mockUser: Partial<User> = {
    id: 1,
    name: 'test',
    password: 'test',
  };

  beforeEach(async () => {
    usersRepository = {
      findOneBy: jest.fn().mockImplementation(() => {
        return Promise.resolve(mockUser);
      }),
      save: jest.fn().mockImplementation((user) => {
        return Promise.resolve(user);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = await service.findOne(1);
      expect(user).toEqual(mockUser);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw an error if user is not found', async () => {
      usersRepository.findOneBy = jest.fn().mockImplementation(() => {
        return Promise.resolve(undefined);
      });

      try {
        await service.findOne(1);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = await service.create(mockUser as User);
      expect(user).toEqual(mockUser);
      expect(usersRepository.save).toHaveBeenCalled();
    });
  });
});
