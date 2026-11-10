import 'dotenv/config'; // carrega o .env local (o Infisical, depois, injeta as mesmas variáveis)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  // Falha cedo, com mensagem clara, se faltar algum segredo.
  const obrigatorias = ['DATABASE_URL', 'JWT_SECRET', 'API_KEY'];
  const faltando = obrigatorias.filter((nome) => !process.env[nome]);
  if (faltando.length > 0) {
    throw new Error(`Variáveis de ambiente ausentes: ${faltando.join(', ')}`);
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Microsserviço de Candidatura')
    .setDescription('Candidaturas, etapas de avaliação, avaliações e atividades')
    .setVersion('1.0')
    .addBearerAuth() // botão "Authorize": cole o JWT
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  document.security = [{ bearer: [] }, { 'api-key': [] }]; // vale para todas as rotas
  SwaggerModule.setup('docs', app, document);

  // Escuta só em localhost (127.0.0.1): alguns PCs/redes bloqueiam 0.0.0.0 (EACCES).
  // Para aceitar conexões de outras máquinas (ex.: deploy), defina HOST=0.0.0.0.
  await app.listen(
    Number(process.env.PORT ?? 3000),
    process.env.HOST ?? '127.0.0.1',
  );
}
bootstrap();
