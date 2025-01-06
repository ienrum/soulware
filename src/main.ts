import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://10.0.2.2:5173',
      'http://192.168.50.48:5173',
      'http://localhost:5173',
    ],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
