import { Injectable } from '@nestjs/common';
import { CandidaturaSituacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEtapaAvaliacaoDto,
  ListEtapasAvaliacaoQuery,
  UpdateEtapaAvaliacaoDto,
} from './etapas-avaliacao.dto';

// Etapa -> avaliações (de todos os candidatos da vaga) -> candidatura + atividades
const INCLUDE_COMPLETO = {
  avaliacoes: {
    include: { candidatura: true, atividades: true },
    orderBy: { id: 'asc' as const },
  },
};

@Injectable()
export class EtapasAvaliacaoService {
  constructor(private readonly prisma: PrismaService) {}

  // Se esta é a PRIMEIRA etapa da vaga, os candidatos que já se candidataram
  // (e ainda estão em análise) entram nela, com a avaliação Pendente.
  create(dto: CreateEtapaAvaliacaoDto) {
    return this.prisma.$transaction(async (tx) => {
      const existentes = await tx.etapaAvaliacao.count({
        where: { vagaId: dto.vagaId },
      });
      const etapa = await tx.etapaAvaliacao.create({ data: dto });

      if (existentes === 0) {
        const candidaturas = await tx.candidatura.findMany({
          where: {
            vagaId: dto.vagaId,
            situacao: CandidaturaSituacao.Em_Analise,
          },
          select: { id: true },
        });
        if (candidaturas.length > 0) {
          await tx.avaliacao.createMany({
            data: candidaturas.map((c) => ({
              candidaturaId: c.id,
              etapaAvaliacaoId: etapa.id,
            })),
          });
        }
      }
      return etapa;
    });
  }

  // Recrutador vê todas as etapas da vaga com as avaliações e atividades de todos
  // os candidatos -> GET /etapas-avaliacao?vagaId=1
  findAll(query: ListEtapasAvaliacaoQuery) {
    return this.prisma.etapaAvaliacao.findMany({
      where: { vagaId: query.vagaId },
      include: INCLUDE_COMPLETO,
      orderBy: { id: 'asc' },
    });
  }

  // Lança P2025 (404) se não existir — tratado pelo PrismaExceptionFilter.
  findOne(id: number) {
    return this.prisma.etapaAvaliacao.findUniqueOrThrow({
      where: { id },
      include: INCLUDE_COMPLETO,
    });
  }

  update(id: number, dto: UpdateEtapaAvaliacaoDto) {
    return this.prisma.etapaAvaliacao.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.etapaAvaliacao.delete({ where: { id } });
  }
}
