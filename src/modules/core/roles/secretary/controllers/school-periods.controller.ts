import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@auth/decorators';
import { CreateSchoolPeriodDto, UpdateSchoolPeriodDto } from '@modules/core/roles/secretary/dto';
import { SchoolPeriodEntity } from '@modules/core/entities';
import { SchoolPeriodsService } from '@modules/core/roles/secretary/services/school-periods.service';
import { ResponseHttpInterface } from '@utils/interfaces';

@ApiTags('School Periods')
@Auth()
@Controller('core/shared/school-periods')
export class SchoolPeriodsController {
  constructor(private readonly schoolPeriodsService: SchoolPeriodsService) { }

  @ApiOperation({ summary: 'Create School Period' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: CreateSchoolPeriodDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.create(payload);

    return {
      data: serviceResponse,
      message: 'Periodo Lectivo Creado',
      title: 'Creado',
    };
  }

  @ApiOperation({ summary: 'Find All School Periods' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.findAll();

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: 'Periodos Lectivos',
      title: 'Success',
    };
  }

  @ApiOperation({ summary: 'Open School Period' })
  // Usado por el front (findOpenSchoolPeriod / auto-selección del período activo)
  @Get('states/open')
  @HttpCode(HttpStatus.OK)
  async findOpenSchoolPeriod(): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.findOpenSchoolPeriod();

    return {
      data: serviceResponse,
      message: 'Periodo lectivo abierto',
      title: 'Success',
    };
  }

  @ApiOperation({ summary: 'Find One School Period' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.findOne(id);

    return {
      data: serviceResponse,
      message: 'Periodo lectivo',
      title: 'Success',
    };
  }

  @ApiOperation({ summary: 'Update School Period' })
  @Put(':id')
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateSchoolPeriodDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.update(id, payload);

    return {
      data: serviceResponse,
      message: 'Periodo Lectivo Actualizado',
      title: 'Actualizado',
    };
  }

  @ApiOperation({ summary: 'Hide School Period' })
  // ─── Acciones de estado (visibilidad + abrir/cerrar matrícula) ────────────────
  @Patch(':id/hide')
  @HttpCode(HttpStatus.CREATED)
  async hide(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.hide(id);

    return {
      data: serviceResponse,
      message: 'Periodo Lectivo Oculto',
      title: 'Ocultado',
    };
  }

  @ApiOperation({ summary: 'Reactivate School Period' })
  @Patch(':id/reactivate')
  @HttpCode(HttpStatus.CREATED)
  async reactivate(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.reactivate(id);

    return {
      data: serviceResponse,
      message: 'Periodo Lectivo Reactivado',
      title: 'Reactivado',
    };
  }

  @ApiOperation({ summary: 'Open School Period' })
  @Patch(':id/open')
  @HttpCode(HttpStatus.CREATED)
  async open(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.open(id);

    return {
      data: serviceResponse,
      message: 'Periodo Lectivo Abierto',
      title: 'Abierto',
    };
  }

  @ApiOperation({ summary: 'Close School Period' })
  @Patch(':id/close')
  @HttpCode(HttpStatus.CREATED)
  async close(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.close(id);

    return {
      data: serviceResponse,
      message: 'Periodo Lectivo Cerrado',
      title: 'Cerrado',
    };
  }

  @ApiOperation({ summary: 'Delete School Period' })
  @Delete(':id')
  @HttpCode(HttpStatus.CREATED)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.remove(id);

    return {
      data: serviceResponse,
      message: 'Periodo Lectivo Eliminado',
      title: 'Eliminado',
    };
  }

  @ApiOperation({ summary: 'Delete All School Periods' })
  @Patch('remove-all')
  @HttpCode(HttpStatus.CREATED)
  async removeAll(@Body() payload: SchoolPeriodEntity[]): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.schoolPeriodsService.removeAll(payload);

    return {
      data: serviceResponse,
      message: 'Periodos Lectivos Eliminados',
      title: 'Eliminados',
    };
  }
}
