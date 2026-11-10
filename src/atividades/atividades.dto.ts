import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAtividadeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  tipo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  link: string;

  @Type(() => Date)
  @IsDate()
  dataInicio: Date;

  @Type(() => Date)
  @IsDate()
  dataFim: Date;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsInt()
  @IsPositive()
  avaliacaoId: number;
}

export class UpdateAtividadeDto extends PartialType(CreateAtividadeDto) {}

export class ListAtividadesQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  avaliacaoId?: number;
}
