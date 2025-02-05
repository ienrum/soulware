import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SALT_ROUNDS_TOKEN } from '../common/constants';
import * as bcrypt from 'bcrypt';
import { SaltRoundsProvider } from './providers/providers';
import { ConfigModule } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let saltRounds: number;

  beforeEach(async () => {
    usersService = {
      create: jest.fn().mockImplementation((user) => {
        return Promise.resolve({ id: 1, ...user });
      }),
      findOne: jest.fn().mockImplementation((id) => {
        return Promise.resolve({ id, name: 'Test User' });
      }),
    } as unknown as jest.Mocked<UsersService>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        AuthService,
        SaltRoundsProvider,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    saltRounds = module.get(SALT_ROUNDS_TOKEN);
  });

  describe('signup', () => {
    it('should successfully create a new user', async () => {
      const userDto = {
        name: 'Test User',
        password: 'password',
      };

      await service.signUp(userDto);

      const createdUser = usersService.create.mock.calls[0][0];
      const isPasswordHashed = await bcrypt.compare(
        userDto.password,
        createdUser.password,
      );
      expect(isPasswordHashed).toBe(true);
    });

    it('should throw an error if the user already exists', async () => {
      const userDto = {
        name: 'Test User',
        password: 'password',
      };

      usersService.create = jest.fn().mockRejectedValue(new Error());

      await expect(service.signUp(userDto)).rejects.toThrow();
    });
  });

  describe('signin', () => {
    it('should successfully sign in a user', async () => {
      const userDto = {
        name: 'Test User',
        password: 'password',
      };

      usersService.findOneById = jest.fn().mockResolvedValue({
        id: 1,
        name: userDto.name,
        password: await bcrypt.hash(userDto.password, saltRounds),
      });

      const token = await service.signIn(userDto);

      expect(token).toBeDefined();
    });

    it('should throw an error if the user does not exist', async () => {
      const userDto = {
        name: 'Test User',
        password: 'password',
      };

      usersService.findOneById = jest.fn().mockResolvedValue(null);

      await expect(service.signIn(userDto)).rejects.toThrow();
    });

    it('should throw an error if the password is incorrect', async () => {
      const userDto = {
        name: 'Test User',
        password: 'password',
      };

      usersService.findOneById = jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test User',
        password: 'hashedPasswordButNotTheSame',
      });

      await expect(service.signIn(userDto)).rejects.toThrow();
    });
  });
});
