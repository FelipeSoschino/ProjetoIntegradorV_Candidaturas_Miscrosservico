import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EtapasAvaliacaoService } from './etapas-avaliacao.service';
import {
  CreateEtapaAvaliacaoDto,
  ListEtapasAvaliacaoQuery,
  UpdateEtapaAvaliacaoDto,
} from './etapas-avaliacao.dto';

@Controller('etapas-avaliacao')
export class EtapasAvaliacaoController {
  constructor(private readonly service: EtapasAvaliacaoService) {}

  @Post()
  create(@Body() dto: CreateEtapaAvaliacaoDto) {
    return this.service.create(dto);
  }

  // GET /etapas-avaliacao?vagaId=1
  @Get()
  findAll(@Query() query: ListEtapasAvaliacaoQuery) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEtapaAvaliacaoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
