import { AvaliacaoSituacao } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateAvaliacaoDto {
  @IsInt()
  @IsPositive()
  etapaAvaliacaoId: number;

  @IsInt()
  @IsPositive()
  candidaturaId: number;

  @IsOptional()
  @IsEnum(AvaliacaoSituacao)
  situacao?: AvaliacaoSituacao;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataInicio?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataFim?: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  nota?: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  // id do recrutador (microsserviço de Usuários)
  @IsOptional()
  @IsInt()
  @IsPositive()
  usuarioId?: number;
}

export class UpdateAvaliacaoDto extends PartialType(CreateAvaliacaoDto) {}

export class ListAvaliacoesQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  candidaturaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  etapaAvaliacaoId?: number;

  @IsOptional()
  @IsEnum(AvaliacaoSituacao)
  situacao?: AvaliacaoSituacao;
}
