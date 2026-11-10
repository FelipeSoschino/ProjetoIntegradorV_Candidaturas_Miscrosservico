import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

// Protege TODAS as rotas (registrado como guard global no AuthModule).
// Passa quem enviar:
//   1) header  x-api-key: <API_KEY>              -> chamadas de outro microsserviço
//   2) header  Authorization: Bearer <JWT>       -> chamadas de usuário (assinado com JWT_SECRET)
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();

    const apiKey = req.headers['x-api-key'];
    if (typeof apiKey === 'string' && this.apiKeyValida(apiKey)) {
      return true;
    }

    const [tipo, token] = req.headers.authorization?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Envie o header Authorization: Bearer <token> ou x-api-key',
      );
    }

    try {
      // O conteúdo do token fica em req.user (ex.: { sub: 1, tipo: 'recrutador' }).
      req.user = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private apiKeyValida(recebida: string): boolean {
    const esperada = process.env.API_KEY ?? '';
    const a = Buffer.from(recebida);
    const b = Buffer.from(esperada);
    return esperada.length > 0 && a.length === b.length && timingSafeEqual(a, b);
  }
}
