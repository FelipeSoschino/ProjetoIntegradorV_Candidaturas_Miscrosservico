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
import { AtividadesService } from './atividades.service';
import {
  CreateAtividadeDto,
  ListAtividadesQuery,
  UpdateAtividadeDto,
} from './atividades.dto';

@Controller('atividades')
export class AtividadesController {
  constructor(private readonly service: AtividadesService) {}

  @Post()
  create(@Body() dto: CreateAtividadeDto) {
    return this.service.create(dto);
  }

  // GET /atividades?avaliacaoId=1
  @Get()
  findAll(@Query() query: ListAtividadesQuery) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAtividadeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
