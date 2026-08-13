import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, Roles, User } from '@auth/decorators';
import { RoleEnum } from '@auth/enums';
import { UserEntity } from '@auth/entities';
import { CreateEnrollmentDto, FilterEnrollmentDto, UpdateEnrollmentDto } from '@modules/core/roles/secretary/dto';
import { EnrollmentEntity } from '@modules/core/entities';
import { EnrollmentsService } from '@modules/core/roles/secretary/services/enrollments.service';
import { EnrollmentDetailsService } from '@modules/core/roles/secretary/services/enrollment-details.service';
import { ResponseHttpInterface } from '@utils/interfaces';

@ApiTags('Secretary — Enrollments')
@Auth()
@Roles(RoleEnum.secretary)
@Controller('core/secretary/enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly enrollmentsDetailService: EnrollmentDetailsService,
  ) { }

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Create Enrollment' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: CreateEnrollmentDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.create(payload);

    return {
      data: serviceResponse,
      message: 'Matrícula creada',
      title: 'Creado',
    };
  }

  @ApiOperation({ summary: 'Find All Enrollments' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() params: FilterEnrollmentDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.findAll(params);

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: 'Buscar matrículas',
      title: 'Success',
    };
  }

  // Usado por el front: GET /careers/:careerId/enrollments
  @ApiOperation({ summary: 'Find Enrollments By Career' })
  @Get('careers/:careerId')
  @HttpCode(HttpStatus.OK)
  async findByCareer(@Param('careerId', ParseUUIDPipe) careerId: string, @Query() params: FilterEnrollmentDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.findEnrollmentsByCareer(careerId, params);

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: 'Buscar matrículas por carrera',
      title: 'Success',
    };
  }

  @ApiOperation({ summary: 'Find Enrollment' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.findOne(id);

    return {
      data: serviceResponse,
      message: 'Buscar matrícula',
      title: 'Success',
    };
  }

  @ApiOperation({ summary: 'Update Enrollment' })
  @Put(':id')
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateEnrollmentDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.update(id, payload);

    return {
      data: serviceResponse,
      message: 'Matrícula Actualizada',
      title: 'Actualizado',
    };
  }

  @ApiOperation({ summary: 'Delete Enrollment' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.remove(id);
    return {
      data: serviceResponse,
      message: 'Matrícula eliminada',
      title: 'Eliminado',
    };
  }

  @ApiOperation({ summary: 'Delete All Enrollments' })
  @Patch('remove-all')
  @HttpCode(HttpStatus.OK)
  async removeAll(@Body() payload: EnrollmentEntity[]): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.removeAll(payload);

    return {
      data: serviceResponse,
      message: 'Matrículas eliminadas',
      title: 'Eliminadas',
    };
  }

  // ─── Asignaturas de la matrícula ──────────────────────────────────────────────
  @ApiOperation({ summary: 'Find Enrollment Details By Enrollment' })
  @Get(':id/enrollment-details')
  @HttpCode(HttpStatus.OK)
  async findEnrollmentDetailsByEnrollment(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsDetailService.findEnrollmentDetailsByEnrollment(id);

    return {
      data: serviceResponse,
      message: 'Success',
      title: 'Success',
    };
  }

  // ─── Flujo de solicitud (registro → envío) ────────────────────────────────────
  @ApiOperation({ summary: 'Send Registration' })
  @Post('send-registration')
  @HttpCode(HttpStatus.CREATED)
  async sendRegistration(@User() user: UserEntity, @Body() payload: any): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.sendRegistration(user.id, payload);

    return {
      data: serviceResponse,
      message: 'Asignaturas Registradas',
      title: 'Registro',
    };
  }

  @ApiOperation({ summary: 'Send Request' })
  @Post(':id/send-request')
  @HttpCode(HttpStatus.CREATED)
  async sendRequest(@User() user: UserEntity, @Param('id') id: string, @Body() payload: UpdateEnrollmentDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.sendRequest(user.id, id, payload);

    return {
      data: serviceResponse,
      message: 'Solicitud Enviada',
      title: 'Solicitud Enviada',
    };
  }

  // ─── Acciones de estado (registrada → aprobada → matriculada / rechazada / anulada) ──
  @ApiOperation({ summary: 'Approve Enrollment' })
  @Patch(':id/approve')
  @HttpCode(HttpStatus.CREATED)
  async approve(@Param('id', ParseUUIDPipe) id: string, @User() user: UserEntity, @Body() payload: UpdateEnrollmentDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.approve(id, user.id, payload);
    return {
      data: serviceResponse,
      message: 'La solicitud fue aprobada',
      title: 'Aprobada',
    };
  }

  @ApiOperation({ summary: 'Reject Enrollment' })
  @Patch(':id/reject')
  @HttpCode(HttpStatus.CREATED)
  async reject(@Param('id', ParseUUIDPipe) id: string, @User() user: UserEntity, @Body() payload: UpdateEnrollmentDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.reject(id, user.id, payload);
    return {
      data: serviceResponse,
      message: 'La solicitud fue rechazada',
      title: 'Rechazada',
    };
  }

  @ApiOperation({ summary: 'Enroll Enrollment' })
  @Patch(':id/enroll')
  @HttpCode(HttpStatus.CREATED)
  async enroll(@Param('id', ParseUUIDPipe) id: string, @User() user: UserEntity, @Body() payload: UpdateEnrollmentDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.enroll(id, user.id, payload);
    return {
      data: serviceResponse,
      message: 'La matrícula fue creada',
      title: 'Matriculado',
    };
  }

  @ApiOperation({ summary: 'Revoke Enrollment' })
  @Patch(':id/revoke')
  @HttpCode(HttpStatus.CREATED)
  async revoke(@Param('id', ParseUUIDPipe) id: string, @User() user: UserEntity, @Body() payload: UpdateEnrollmentDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.enrollmentsService.revoke(id, user.id, payload);
    return {
      data: serviceResponse,
      message: 'La matrícula fue anulada',
      title: 'Anulada',
    };
  }
}
