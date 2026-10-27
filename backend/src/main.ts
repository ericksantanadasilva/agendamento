import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Atrás do Nginx Proxy Manager, o IP real vem no cabeçalho X-Forwarded-For.
  // Só ligar em produção (TRUST_PROXY=1): sem proxy, esse cabeçalho pode ser forjado.
  const trustProxy = Number(process.env.TRUST_PROXY ?? 0);
  if (trustProxy > 0) {
    app.set('trust proxy', trustProxy);
  }

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend Agendamento API rodando na porta ${port}`);
}

bootstrap();
