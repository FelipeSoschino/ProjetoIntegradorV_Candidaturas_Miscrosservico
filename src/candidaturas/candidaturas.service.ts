import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCandidaturaDto,
  ListCandidaturasQuery,
  UpdateCandidaturaDto,
} from './candidaturas.dto';

// Candidatura -> avaliações -> (etapa + atividades)
const INCLUDE_COMPLETO = {
  avaliacoes: {
    include: { etapaAvaliacao: true, atividades: true },
    orderBy: { id: 'asc' as const },
  },
};

@Injectable()
export class CandidaturasService {
  constructor(private readonly prisma: PrismaService) {}

  // O candidato se candidata e já entra na PRIMEIRA etapa da vaga:
  // criamos a avaliação (Pendente) dessa etapa. Se a vaga ainda não tem etapas,
  // a avaliação é criada quando o recrutador cadastrar a primeira etapa.
  async create(dto: CreateCandidaturaDto) {
    // O banco não tem UNIQUE em (usuario_id, vaga_id), então checamos aqui.
    const existente = await this.prisma.candidatura.findFirst({
      where: { usuarioId: dto.usuarioId, vagaId: dto.vagaId },
    });
    if (existente) {
      throw new ConflictException('Este usuário já se candidatou a esta vaga');
    }

    return this.prisma.$transaction(async (tx) => {
      const candidatura = await tx.candidatura.create({ data: dto });

      // "Primeira" etapa = a de menor id da vaga (o banco não tem coluna de ordem).
      const primeiraEtapa = await tx.etapaAvaliacao.findFirst({
        where: { vagaId: dto.vagaId },
        orderBy: { id: 'asc' },
      });
      if (primeiraEtapa) {
        await tx.avaliacao.create({
          data: {
            candidaturaId: candidatura.id,
            etapaAvaliacaoId: primeiraEtapa.id,
          },
        });
      }

      return tx.candidatura.findUniqueOrThrow({
        where: { id: candidatura.id },
        include: INCLUDE_COMPLETO,
      });
    });
  }

  // Ex.: candidaturas de uma vaga -> GET /candidaturas?vagaId=1
  // Ex.: minhas candidaturas     -> GET /candidaturas?usuarioId=10
  findAll(query: ListCandidaturasQuery) {
    return this.prisma.candidatura.findMany({
      where: {
        vagaId: query.vagaId,
        usuarioId: query.usuarioId,
        situacao: query.situacao,
      },
      include: INCLUDE_COMPLETO,
      orderBy: { data: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.candidatura.findUniqueOrThrow({
      where: { id },
      include: INCLUDE_COMPLETO,
    });
  }

  update(id: number, dto: UpdateCandidaturaDto) {
    return this.prisma.candidatura.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.candidatura.delete({ where: { id } });
  }
}
