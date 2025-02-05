import { Test, TestingModule } from '@nestjs/testing';
import { ThreadsService } from './threads.service';
import { Thread } from './entities/thread.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateThreadDto } from './dtos/create-thread.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/User.entity';
import { Comment } from '../comments/entities/comment.entity';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('ThreadsService', () => {
  let service: ThreadsService;
  let usersService: jest.Mocked<UsersService>;
  let threadsRepository: Partial<Record<keyof Repository<Thread>, jest.Mock>>;

  const mockUser: Partial<User> = {
    id: 1,
    name: 'test',
    password: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: Promise.resolve([] as Comment[]),
  };

  const mockThreadList = Array.from({ length: 3 }, (_, i) => {
    const thread = new Thread();
    thread.id = i + 1;
    thread.title = `Title ${i + 1}`;
    thread.content = `Content ${i + 1}`;
    thread.user = mockUser as User;
    return thread;
  });

  beforeEach(async () => {
    threadsRepository = {
      find: jest.fn().mockImplementation(() => {
        return Promise.resolve(mockThreadList);
      }),
      findOne: jest.fn().mockImplementation(() => {
        return Promise.resolve(mockThreadList[0]);
      }),
      save: jest.fn().mockImplementation((thread) => {
        return Promise.resolve(thread);
      }),
      create: jest.fn().mockImplementation((thread) => {
        return thread;
      }),
      count: jest.fn().mockImplementation(() => {
        return Promise.resolve(mockThreadList.length);
      }),
      update: jest.fn().mockImplementation(() => {
        return Promise.resolve({ affected: 1 });
      }),
      delete: jest.fn().mockImplementation(() => {
        return Promise.resolve({ affected: 1 });
      }),
    };

    usersService = {
      findOne: jest.fn().mockImplementation(() => {
        return Promise.resolve({ id: 1 });
      }),
    } as unknown as jest.Mocked<UsersService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreadsService,
        UsersService,
        {
          provide: getRepositoryToken(Thread),
          useValue: threadsRepository,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<ThreadsService>(ThreadsService);
  });

  describe('create', () => {
    it('should create a thread', async () => {
      const threadDto: CreateThreadDto = {
        title: 'Title 1',
        content: 'Content 1',
      };

      await service.create(1, threadDto);
      expect(usersService.findOneById).toHaveBeenCalledWith(1);
      expect(threadsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(threadDto),
      );
    });
  });

  describe('findOne', () => {
    it('should return a thread', async () => {
      const thread = await service.findOne(1);
      expect(thread).toEqual(mockThreadList[0]);
    });

    it('should throw an error if thread is not found', async () => {
      threadsRepository.findOne = jest.fn().mockImplementation(() => {
        return Promise.resolve(undefined);
      });

      try {
        await service.findOne(1);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('findAll', () => {
    it('should return a list of threads', async () => {
      const threads = await service.findAll();
      expect(threads).toEqual({
        threads: mockThreadList,
        totalPage: 1,
      });
    });

    it('should return a list of threads with pagination', async () => {
      const threads = await service.findAll(1, 2);
      expect(threads).toEqual({
        threads: mockThreadList,
        totalPage: 2,
      });
    });

    it('should return an empty list if no threads are found', async () => {
      threadsRepository.find = jest.fn().mockImplementation(() => {
        return Promise.resolve([]);
      });

      const threads = await service.findAll();
      expect(threads).toEqual({
        threads: [],
        totalPage: 1,
      });
    });
  });

  describe('update', () => {
    it('should update a thread', async () => {
      const threadDto: CreateThreadDto = {
        title: 'Title 1',
        content: 'Content 1',
      };

      await service.update(1, threadDto, 1);
      expect(threadsRepository.update).toHaveBeenCalledWith(1, threadDto);
    });

    it('should throw an error if the user is not the author', async () => {
      threadsRepository.update = jest.fn().mockImplementation(() => {
        return Promise.resolve({ affected: 0 });
      });

      try {
        await service.update(1, {} as CreateThreadDto, 1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to update thread');
      }
    });
  });

  describe('delete', () => {
    it('should delete a thread', async () => {
      await service.delete(1, 1);
      expect(threadsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if the user is not the author', async () => {
      threadsRepository.delete = jest.fn().mockImplementation(() => {
        return Promise.resolve({ affected: 0 });
      });

      try {
        await service.delete(1, 1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to delete thread');
      }
    });
  });

  describe('getAndCheckIsAuthor', () => {
    it('should return a thread', async () => {
      const thread = await service.getAndCheckIsAuthor(1, 1);
      expect(thread).toEqual(mockThreadList[0]);
    });

    it('should throw an error if the user is not the author', async () => {
      try {
        await service.getAndCheckIsAuthor(1, 2);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
