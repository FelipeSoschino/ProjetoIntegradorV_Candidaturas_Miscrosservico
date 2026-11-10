import { Injectable } from '@nestjs/common';
import { AvaliacaoSituacao, CandidaturaSituacao, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAvaliacaoDto,
  ListAvaliacoesQuery,
  UpdateAvaliacaoDto,
} from './avaliacoes.dto';

const INCLUDE_COMPLETO = {
  etapaAvaliacao: true,
  candidatura: true,
  atividades: true,
};

@Injectable()
export class AvaliacoesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAvaliacaoDto) {
    return this.prisma.avaliacao.create({ data: dto });
  }

  findAll(query: ListAvaliacoesQuery) {
    return this.prisma.avaliacao.findMany({
      where: {
        candidaturaId: query.candidaturaId,
        etapaAvaliacaoId: query.etapaAvaliacaoId,
        situacao: query.situacao,
      },
      include: INCLUDE_COMPLETO,
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.avaliacao.findUniqueOrThrow({
      where: { id },
      include: INCLUDE_COMPLETO,
    });
  }

  // O recrutador avalia: PATCH /avaliacoes/:id
  //   { "situacao": "Aprovado", "nota": 8, "feedback": "...", "usuarioId": <recrutador> }
  //
  // Regras ao MUDAR a situação:
  //  - Aprovado : abre a avaliação (Pendente) da PRÓXIMA etapa da vaga para o candidato.
  //               Se não há próxima etapa, a candidatura fica Aprovada.
  //  - Reprovado: a candidatura fica Reprovada.
  // "Próxima etapa" = a etapa da mesma vaga com o menor id maior que o da atual.
  update(id: number, dto: UpdateAvaliacaoDto) {
    return this.prisma.$transaction(async (tx) => {
      const atual = await tx.avaliacao.findUniqueOrThrow({
        where: { id },
        include: { etapaAvaliacao: true },
      });

      const mudouSituacao =
        dto.situacao !== undefined && dto.situacao !== atual.situacao;

      const data: Prisma.AvaliacaoUncheckedUpdateInput = { ...dto };
      const finalizou =
        dto.situacao === AvaliacaoSituacao.Aprovado ||
        dto.situacao === AvaliacaoSituacao.Reprovado;
      if (mudouSituacao && finalizou && dto.dataFim === undefined) {
        data.dataFim = new Date();
      }

      await tx.avaliacao.update({ where: { id }, data });

      if (mudouSituacao && dto.situacao === AvaliacaoSituacao.Aprovado) {
        const proxima = await tx.etapaAvaliacao.findFirst({
          where: {
            vagaId: atual.etapaAvaliacao.vagaId,
            id: { gt: atual.etapaAvaliacaoId },
          },
          orderBy: { id: 'asc' },
        });

        if (proxima) {
          const jaExiste = await tx.avaliacao.findFirst({
            where: {
              candidaturaId: atual.candidaturaId,
              etapaAvaliacaoId: proxima.id,
            },
          });
          if (!jaExiste) {
            await tx.avaliacao.create({
              data: {
                candidaturaId: atual.candidaturaId,
                etapaAvaliacaoId: proxima.id,
              },
            });
          }
        } else {
          await tx.candidatura.update({
            where: { id: atual.candidaturaId },
            data: { situacao: CandidaturaSituacao.Aprovado },
          });
        }
      }

      if (mudouSituacao && dto.situacao === AvaliacaoSituacao.Reprovado) {
        await tx.candidatura.update({
          where: { id: atual.candidaturaId },
          data: { situacao: CandidaturaSituacao.Reprovado },
        });
      }

      return tx.avaliacao.findUniqueOrThrow({
        where: { id },
        include: INCLUDE_COMPLETO,
      });
    });
  }

  remove(id: number) {
    return this.prisma.avaliacao.delete({ where: { id } });
  }
}
