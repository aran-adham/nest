import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser())

  app.enableCors({
    origin: "http://localhost:3000", // Ensure this matches exactly with your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Explicitly allowing methods
    credentials: true, // Allow cookies to be included in cross-origin requests
    allowedHeaders: 'Content-Type, Accept, Authorization', // Ensure necessary headers are allowed
  });
  await app.listen(8000);
}
bootstrap();
