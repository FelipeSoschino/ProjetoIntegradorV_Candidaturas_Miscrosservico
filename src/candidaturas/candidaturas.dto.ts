import { CandidaturaSituacao } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreateCandidaturaDto {
  @IsInt()
  @IsPositive()
  usuarioId: number;

  @IsInt()
  @IsPositive()
  vagaId: number;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsEnum(CandidaturaSituacao)
  situacao?: CandidaturaSituacao;
}

export class UpdateCandidaturaDto extends PartialType(CreateCandidaturaDto) {}

export class ListCandidaturasQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vagaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsEnum(CandidaturaSituacao)
  situacao?: CandidaturaSituacao;
}
