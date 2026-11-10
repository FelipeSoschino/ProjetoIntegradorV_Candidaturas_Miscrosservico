import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EtapasAvaliacaoModule } from './etapas-avaliacao/etapas-avaliacao.module';
import { CandidaturasModule } from './candidaturas/candidaturas.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { AtividadesModule } from './atividades/atividades.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EtapasAvaliacaoModule,
    CandidaturasModule,
    AvaliacoesModule,
    AtividadesModule,
  ],
})
export class AppModule {
    constructor() {
    console.log("Aplicação iniciada!");
    console.log("Banco:", process.env.DATABASE_URL);
    console.log("API Key:", process.env.API_KEY);
    console.log("JWT Secret:", process.env.JWT_SECRET);   
  }
}
