import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser())

  app.enableCors({
    origin: "*", // Ensure this matches exactly with your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Explicitly allowing methods
    credentials: true, // Allow cookies to be included in cross-origin requests
    allowedHeaders: 'Content-Type, Accept, Authorization', // Ensure necessary headers are allowed
  });
  await app.listen(process.env.PORT,'0.0.0.0');
}
bootstrap();
