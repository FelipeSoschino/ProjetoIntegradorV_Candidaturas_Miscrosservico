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
import { CandidaturasService } from './candidaturas.service';
import {
  CreateCandidaturaDto,
  ListCandidaturasQuery,
  UpdateCandidaturaDto,
} from './candidaturas.dto';

@Controller('candidaturas')
export class CandidaturasController {
  constructor(private readonly service: CandidaturasService) {}

  @Post()
  create(@Body() dto: CreateCandidaturaDto) {
    return this.service.create(dto);
  }

  // GET /candidaturas?vagaId=1&situacao=Em_Analise
  @Get()
  findAll(@Query() query: ListCandidaturasQuery) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCandidaturaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
