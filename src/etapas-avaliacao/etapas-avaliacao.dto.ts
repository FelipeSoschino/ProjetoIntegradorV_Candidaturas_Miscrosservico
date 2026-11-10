import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEtapaAvaliacaoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  responsavel: string;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsInt()
  @IsPositive()
  vagaId: number;
}

export class UpdateEtapaAvaliacaoDto extends PartialType(
  CreateEtapaAvaliacaoDto,
) {}

export class ListEtapasAvaliacaoQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vagaId?: number;
}
