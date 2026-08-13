import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, Roles, User } from '@auth/decorators';
import { RoleEnum } from '@auth/enums';
import { UserEntity } from '@auth/entities';
import {
  CreateEnrollmentsDetailDto,
  UpdateEnrollmentsDetailDto,
  FilterEnrollmentsDetailDto,
} from '@modules/core/roles/secretary/dto';
import { EnrollmentDetailsService } from '@modules/core/roles/secretary/services/enrollment-details.service';
import { EnrollmentDetailEntity } from '@modules/core/entities';
import { ResponseHttpInterface } from '@utils/interfaces';

@ApiTags('Secretary — Enrollment Details')
@Auth()
@Roles(RoleEnum.secretary)
@Controller('core/secretary/enrollment-details')
export class EnrollmentDetailsController {
  constructor(private enrollmentDetailsService: EnrollmentDetailsService) { }

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Create Enrollment Detail' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@User() user: UserEntity, @Body() payload: CreateEnrollmentsDetailDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.create(user.id, payload);

    return {
      data: serviceResponse,
      message: 'Detalle de matrícula creado',
      title: 'Creado',
    };
  }

  @ApiOperation({ summary: 'Find All Enrollment Details' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() params: FilterEnrollmentsDetailDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.findAll(params);

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: 'Buscar detalles de matrícula',
      title: 'Success',
    };
  }

  @ApiOperation({ summary: 'Find Enrollment Detail' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.findOne(id);

    return {
      data: serviceResponse,
      message: 'Buscar detalle de matrícula',
      title: 'Success',
    };
  }

  @ApiOperation({ summary: 'Update Enrollment Detail' })
  @Put(':id')
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateEnrollmentsDetailDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.update(id, payload);
    return {
      data: serviceResponse,
      message: 'Detalle de matrícula actualizado',
      title: 'Actualizado',
    };
  }

  @ApiOperation({ summary: 'Delete Enrollment Detail' })
  @Delete(':id')
  @HttpCode(HttpStatus.CREATED)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.remove(id);
    return {
      data: serviceResponse,
      message: 'Detalle de matrícula eliminado',
      title: 'Eliminado',
    };
  }

  @ApiOperation({ summary: 'Delete All Enrollment Details' })
  @Patch('remove-all')
  @HttpCode(HttpStatus.CREATED)
  async removeAll(@Body() payload: EnrollmentDetailEntity[]): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.removeAll(payload);

    return {
      data: serviceResponse,
      message: 'Detalles de matrícula eliminados',
      title: 'Eliminados',
    };
  }

  // ─── Acciones de estado (misma lógica que Enrollments, a nivel de asignatura) ──
  @ApiOperation({ summary: 'Approve Enrollment Detail' })
  @Patch(':id/approve')
  @HttpCode(HttpStatus.CREATED)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserEntity,
    @Body() payload: UpdateEnrollmentsDetailDto,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.approve(id, user.id, payload);
    return {
      data: serviceResponse,
      message: 'La solicitud fue aprobada',
      title: 'Aprobada',
    };
  }

  @ApiOperation({ summary: 'Reject Enrollment Detail' })
  @Patch(':id/reject')
  @HttpCode(HttpStatus.CREATED)
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserEntity,
    @Body() payload: UpdateEnrollmentsDetailDto,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.reject(id, user.id, payload);
    return {
      data: serviceResponse,
      message: 'La solicitud fue rechazada',
      title: 'Rechazada',
    };
  }

  @ApiOperation({ summary: 'Enroll Enrollment Detail' })
  @Patch(':id/enroll')
  @HttpCode(HttpStatus.CREATED)
  async enroll(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserEntity,
    @Body() payload: UpdateEnrollmentsDetailDto,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.enroll(id, user.id, payload);
    return {
      data: serviceResponse,
      message: 'La matrícula fue creada',
      title: 'Matriculado',
    };
  }

  @ApiOperation({ summary: 'Revoke Enrollment Detail' })
  @Patch(':id/revoke')
  @HttpCode(HttpStatus.CREATED)
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserEntity,
    @Body() payload: UpdateEnrollmentsDetailDto,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.revoke(id, user.id, payload);
    return {
      data: serviceResponse,
      message: 'La matrícula fue anulada',
      title: 'Anulada',
    };
  }

  // ─── Flujo de solicitud ───────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Send Request' })
  @Post(':id/send-request')
  @HttpCode(HttpStatus.CREATED)
  async sendRequest(
    @User() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: CreateEnrollmentsDetailDto,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentDetailsService.sendRequest(user.id, id, payload);

    return {
      data: serviceResponse,
      message: 'Detalle de matrícula creado',
      title: 'Creado',
    };
  }
}
