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
import { AvaliacoesService } from './avaliacoes.service';
import {
  CreateAvaliacaoDto,
  ListAvaliacoesQuery,
  UpdateAvaliacaoDto,
} from './avaliacoes.dto';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly service: AvaliacoesService) {}

  @Post()
  create(@Body() dto: CreateAvaliacaoDto) {
    return this.service.create(dto);
  }

  // GET /avaliacoes?candidaturaId=1
  @Get()
  findAll(@Query() query: ListAvaliacoesQuery) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvaliacaoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
