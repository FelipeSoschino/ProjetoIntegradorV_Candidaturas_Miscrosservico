import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

// Converte erros conhecidos do Prisma em respostas HTTP adequadas.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    const map: Record<string, [number, string]> = {
      P2002: [409, 'Registro duplicado (valor único já existe)'],
      P2003: [
        400,
        'Referência inválida: o registro relacionado não existe ou ainda é usado por outro',
      ],
      P2025: [404, 'Registro não encontrado'],
    };

    const [statusCode, message] = map[exception.code] ?? [
      500,
      'Erro no banco de dados',
    ];

    res.status(statusCode).json({ statusCode, message, code: exception.code });
  }
}
