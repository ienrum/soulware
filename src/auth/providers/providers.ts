import { SALT_ROUNDS_TOKEN } from '../../common/constants';
import { ConfigService } from '@nestjs/config';

export const SaltRoundsProvider = {
  provide: SALT_ROUNDS_TOKEN,
  useFactory: (configService: ConfigService) => {
    const envSalt = configService.get<string>('SALT_ROUNDS');
    return parseInt(envSalt, 10);
  },
  inject: [ConfigService],
};
