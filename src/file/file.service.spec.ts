import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { Repository, In } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { ThreadsService } from '../threads/threads.service';
import { FileApiService } from '../file-api/file-api.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'typeorm/platform/PlatformTools';

describe('FileService', () => {
  let service: FileService;
  let fileRepository: Partial<Record<keyof Repository<File>, jest.Mock>>;
  let threadsService: Partial<Record<keyof ThreadsService, jest.Mock>>;
  let fileApiService: Partial<Record<keyof FileApiService, jest.Mock>>;

  const mockFileEntity = {
    id: 1,
    name: 'test-file.jpg',
    originalName: 'original-test-file.jpg',
    path: '/uploads/test-file.jpg',
    size: 12345,
    threadId: 1,
    userId: 1,
  };

  const mockThread = {
    id: 1,
    title: 'Test Thread',
    content: 'Thread content',
    isAuthorBy: (userId: number) => userId === 1,
  };

  beforeEach(async () => {
    fileRepository = {
      create: jest.fn().mockImplementation((file: Partial<File>) => file),
      save: jest.fn().mockResolvedValue(mockFileEntity),
      find: jest.fn().mockResolvedValue([mockFileEntity]),
      findOne: jest.fn().mockResolvedValue(mockFileEntity),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    threadsService = {
      findOne: jest.fn().mockResolvedValue(mockThread),
    };

    fileApiService = {
      checkFileExist: jest.fn(),
      deleteFiles: jest.fn().mockImplementation((files: File[]) => files),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: getRepositoryToken(File),
          useValue: fileRepository,
        },
        {
          provide: ThreadsService,
          useValue: threadsService,
        },
        {
          provide: FileApiService,
          useValue: fileApiService,
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  describe('uploadFiles', () => {
    const fakeFiles: Express.Multer.File[] = [
      {
        fieldname: 'file',
        originalname: 'original-test-file.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/uploads',
        filename: 'test-file.jpg',
        path: '/uploads/test-file.jpg',
        size: 12345,
        buffer: Buffer.from([]),
        stream: new Readable(),
      },
    ];

    it('should throw BadRequestException if no files are provided', async () => {
      await expect(service.uploadFiles([], 1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if the user is not the owner of the thread', async () => {
      threadsService.findOne = jest.fn().mockResolvedValue({
        ...mockThread,
        isAuthorBy: () => false,
      });

      await expect(service.uploadFiles(fakeFiles, 1, 2)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should upload files successfully', async () => {
      await service.uploadFiles(fakeFiles, 1, 1);

      expect(fileApiService.checkFileExist).toHaveBeenCalledWith(
        fakeFiles[0].path,
      );
      expect(threadsService.findOne).toHaveBeenCalledWith(1);
      expect(fileRepository.create).toHaveBeenCalledWith({
        name: fakeFiles[0].filename,
        originalName: fakeFiles[0].originalname,
        path: fakeFiles[0].path,
        size: fakeFiles[0].size,
        threadId: 1,
        userId: 1,
      });
      expect(fileRepository.save).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if file saving fails', async () => {
      fileRepository.save = jest.fn().mockResolvedValue(null);
      await expect(service.uploadFiles(fakeFiles, 1, 1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getFiles', () => {
    it('should return files for a given thread', async () => {
      const result = await service.getFiles(1);
      expect(fileRepository.find).toHaveBeenCalledWith({
        where: {
          thread: { id: 1 },
        },
        relations: ['thread'],
      });
      expect(result).toEqual([mockFileEntity]);
    });
  });

  describe('getAndCheckFileExist', () => {
    it('should return the file if it exists', async () => {
      const result = await service.getAndCheckFileExist(1);
      expect(fileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(fileApiService.checkFileExist).toHaveBeenCalledWith(
        mockFileEntity.path,
      );
      expect(result).toEqual(mockFileEntity);
    });

    it('should throw NotFoundException if the file is not found', async () => {
      fileRepository.findOne = jest.fn().mockResolvedValue(undefined);
      await expect(service.getAndCheckFileExist(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteFiles', () => {
    it('should throw BadRequestException if ids array is empty', async () => {
      await expect(service.deleteFiles([])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if files are not found', async () => {
      fileRepository.find = jest.fn().mockResolvedValue([]);
      await expect(service.deleteFiles([1])).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if deleted files count does not match provided ids', async () => {
      fileApiService.deleteFiles = jest.fn().mockReturnValue([]);
      await expect(service.deleteFiles([1])).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(fileRepository.delete).toHaveBeenCalledWith({ id: In([]) });
    });

    it('should delete files successfully', async () => {
      fileApiService.deleteFiles = jest.fn().mockReturnValue([mockFileEntity]);
      fileRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });
      await service.deleteFiles([1]);
      expect(fileApiService.deleteFiles).toHaveBeenCalled();
      expect(fileRepository.delete).toHaveBeenCalledWith({ id: In([1]) });
    });

    it('should throw InternalServerErrorException if repository delete affects 0 records', async () => {
      fileApiService.deleteFiles = jest.fn().mockReturnValue([mockFileEntity]);
      fileRepository.delete = jest.fn().mockResolvedValue({ affected: 0 });
      await expect(service.deleteFiles([1])).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
