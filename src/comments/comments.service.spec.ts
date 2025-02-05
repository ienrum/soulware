import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { ThreadsService } from '../threads/threads.service';
import { UsersService } from 'src/users/users.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentsRepository: Partial<Record<keyof Repository<Comment>, jest.Mock>>;
  let threadsService: Partial<Record<keyof ThreadsService, jest.Mock>>;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockThread = {
    id: 1,
    title: 'Test Thread',
    content: 'Test Content',
  };

  const mockComment = {
    id: 1,
    content: 'Test Comment',
    user: mockUser,
    thread: Promise.resolve(mockThread),
    createdAt: new Date(),
    updatedAt: new Date(),
    isAuthorBy: (userId: number) => userId === mockUser.id,
  };

  beforeEach(async () => {
    commentsRepository = {
      find: jest.fn().mockResolvedValue([mockComment]),
      findOne: jest.fn().mockResolvedValue(mockComment),
      create: jest.fn().mockImplementation((comment) => comment),
      save: jest.fn().mockResolvedValue(mockComment),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    threadsService = {
      findOne: jest.fn().mockResolvedValue(mockThread),
    };

    usersService = {
      findOneById: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: commentsRepository,
        },
        {
          provide: ThreadsService,
          useValue: threadsService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  describe('findAllForThread', () => {
    it('should return an array of comments for a given thread', async () => {
      const result = await service.findAllForThread(1);
      expect(commentsRepository.find).toHaveBeenCalledWith({
        where: { thread: { id: 1 } },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockComment]);
    });
  });

  describe('findOne', () => {
    it('should return a comment if found', async () => {
      const comment = await service.findOne(1);
      expect(commentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(comment).toEqual(mockComment);
    });

    it('should throw NotFoundException if comment is not found', async () => {
      commentsRepository.findOne = jest.fn().mockResolvedValue(undefined);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const createCommentDto: CreateCommentDto = { content: 'New comment' };

      await service.create(1, 1, createCommentDto);

      expect(threadsService.findOne).toHaveBeenCalledWith(1);
      expect(commentsRepository.save).toHaveBeenCalledWith({
        content: createCommentDto.content,
        user: mockUser,
        thread: Promise.resolve(),
      });
      expect(commentsRepository.save).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if saving comment fails', async () => {
      commentsRepository.save = jest.fn().mockResolvedValue(null);
      const createCommentDto: CreateCommentDto = { content: 'New comment' };

      await expect(service.create(1, 1, createCommentDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a comment successfully', async () => {
      commentsRepository.findOne = jest.fn().mockResolvedValue({
        ...mockComment,
        isAuthorBy: (userId: number) => userId === mockUser.id,
      });
      const updateCommentDto: UpdateCommentDto = { content: 'Updated comment' };

      await service.update(1, 1, updateCommentDto);
      expect(commentsRepository.update).toHaveBeenCalledWith(1, {
        ...updateCommentDto,
      });
    });

    it('should throw NotFoundException if user is not the author', async () => {
      commentsRepository.findOne = jest.fn().mockResolvedValue({
        ...mockComment,
        isAuthorBy: () => false,
      });
      const updateCommentDto: UpdateCommentDto = { content: 'Updated comment' };

      await expect(service.update(2, 1, updateCommentDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      commentsRepository.findOne = jest.fn().mockResolvedValue({
        ...mockComment,
        isAuthorBy: (userId: number) => userId === mockUser.id,
      });
      commentsRepository.update = jest.fn().mockResolvedValue({ affected: 0 });
      const updateCommentDto: UpdateCommentDto = { content: 'Updated comment' };

      await expect(service.update(1, 1, updateCommentDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a comment successfully', async () => {
      commentsRepository.findOne = jest.fn().mockResolvedValue({
        ...mockComment,
        isAuthorBy: (userId: number) => userId === mockUser.id,
      });

      await service.delete(1, 1);
      expect(commentsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user is not the author', async () => {
      commentsRepository.findOne = jest.fn().mockResolvedValue({
        ...mockComment,
        isAuthorBy: () => false,
      });

      await expect(service.delete(2, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      commentsRepository.findOne = jest.fn().mockResolvedValue({
        ...mockComment,
        isAuthorBy: (userId: number) => userId === mockUser.id,
      });
      commentsRepository.delete = jest.fn().mockResolvedValue({ affected: 0 });

      await expect(service.delete(1, 1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getAndCheckIsAuthor', () => {
    it('should return the comment if user is the author', async () => {
      const comment = await service.getAndCheckIsAuthor(1, 1);
      expect(comment).toEqual(mockComment);
    });

    it('should throw NotFoundException if user is not the author', async () => {
      commentsRepository.findOne = jest.fn().mockResolvedValue({
        ...mockComment,
        isAuthorBy: () => false,
      });

      await expect(service.getAndCheckIsAuthor(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
