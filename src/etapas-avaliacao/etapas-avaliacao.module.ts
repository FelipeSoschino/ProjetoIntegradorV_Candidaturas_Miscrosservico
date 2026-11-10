import { Module } from '@nestjs/common';
import { EtapasAvaliacaoController } from './etapas-avaliacao.controller';
import { EtapasAvaliacaoService } from './etapas-avaliacao.service';

@Module({
  controllers: [EtapasAvaliacaoController],
  providers: [EtapasAvaliacaoService],
})
export class EtapasAvaliacaoModule {}
