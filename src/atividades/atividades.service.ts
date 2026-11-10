import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAtividadeDto,
  ListAtividadesQuery,
  UpdateAtividadeDto,
} from './atividades.dto';

@Injectable()
export class AtividadesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAtividadeDto) {
    return this.prisma.atividade.create({ data: dto });
  }

  findAll(query: ListAtividadesQuery) {
    return this.prisma.atividade.findMany({
      where: { avaliacaoId: query.avaliacaoId },
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.atividade.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, dto: UpdateAtividadeDto) {
    return this.prisma.atividade.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.atividade.delete({ where: { id } });
  }
}
