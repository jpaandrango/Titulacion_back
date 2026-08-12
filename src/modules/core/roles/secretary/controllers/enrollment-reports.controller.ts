import { Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Param, ParseUUIDPipe, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, Roles } from '@auth/decorators';
import { RoleEnum } from '@auth/enums';
import { Response } from 'express';
import { EnrollmentReportsService } from '@modules/core/roles/secretary/services/enrollment-reports.service';
import { ResponseHttpInterface } from '@utils/interfaces';

@ApiTags('Secretary — Enrollment Reports')
@Auth()
@Roles(RoleEnum.secretary)
@Controller('core/secretary/enrollment-reports')
export class EnrollmentReportsController {
  constructor(private enrollmentReportsService: EnrollmentReportsService) { }

  @ApiOperation({ summary: 'Enrollment Certificate Report (PDF)' })
  @Get(':id/certificate')
  @HttpCode(HttpStatus.OK)
  async generateEnrollmentCertificate(@Res() res: Response, @Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    await this.enrollmentReportsService.generateEnrollmentCertificate(res, id);
    return { data: null, message: 'Certificado de matrícula', title: 'Reporte' };
  }

  @ApiOperation({ summary: 'Enrollments by Career (XLSX)' })
  @Get('careers/:careerId')
  @HttpCode(HttpStatus.OK)
  async generateEnrollmentsByCareer(
    @Res() res: Response,
    @Param('careerId', ParseUUIDPipe) careerId: string,
    @Query('schoolPeriodId') schoolPeriodId: string,
  ): Promise<ResponseHttpInterface> {
    const path = await this.enrollmentReportsService.generateEnrollmentsByCareer(careerId, schoolPeriodId);
    await this.sendFileSafely(res, path);
    return { data: null, message: 'Matriculados por carrera', title: 'Reporte' };
  }

  @ApiOperation({ summary: 'Enrollments by School Period (XLSX)' })
  @Get('school-periods/:schoolPeriodId')
  @HttpCode(HttpStatus.OK)
  async generateEnrollmentsBySchoolPeriod(@Res() res: Response, @Param('schoolPeriodId', ParseUUIDPipe) schoolPeriodId: string): Promise<ResponseHttpInterface> {
    const path = await this.enrollmentReportsService.generateEnrollmentsBySchoolPeriod(schoolPeriodId);
    await this.sendFileSafely(res, path);
    return { data: null, message: 'Matriculados por período lectivo', title: 'Reporte' };
  }

  @ApiOperation({ summary: 'Enrollment Details by School Period (XLSX)' })
  @Get('enrollment-details/:schoolPeriodId')
  @HttpCode(HttpStatus.OK)
  async generateEnrollmentDetailsBySchoolPeriod(@Res() res: Response, @Param('schoolPeriodId', ParseUUIDPipe) schoolPeriodId: string): Promise<ResponseHttpInterface> {
    const path = await this.enrollmentReportsService.generateEnrollmentDetailsBySchoolPeriod(schoolPeriodId);
    await this.sendFileSafely(res, path);
    return { data: null, message: 'Asignaturas matriculadas por período lectivo', title: 'Reporte' };
  }

  private sendFileSafely(res: Response, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      res.sendFile(path, (error) => {
        if (error) {
          if (!res.headersSent) {
            reject(new InternalServerErrorException('No se pudo generar el reporte'));
          } else {
            reject(error);
          }
          return;
        }
        resolve();
      });
    });
  }
}