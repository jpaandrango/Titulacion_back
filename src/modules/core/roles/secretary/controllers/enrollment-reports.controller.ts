import { Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Param, ParseUUIDPipe, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, Roles } from '@auth/decorators';
import { RoleEnum } from '@auth/enums';
import { Response } from 'express';
import { EnrollmentReportsService } from '@modules/core/roles/secretary/services/enrollment-reports.service';

@ApiTags('Secretary — Enrollment Reports')
@Auth()
@Roles(RoleEnum.secretary)
@Controller('core/secretary/enrollment-reports')
export class EnrollmentReportsController {
  constructor(private enrollmentReportsService: EnrollmentReportsService) {}

  @ApiOperation({ summary: 'Enrollment Certificate Report (PDF)' })
  @Get(':id/certificate')
  @HttpCode(HttpStatus.OK)
  async generateEnrollmentCertificate(@Res() res: Response, @Param('id', ParseUUIDPipe) id: string): Promise<any> {
    await this.enrollmentReportsService.generateEnrollmentCertificate(res, id);
    // Ver nota en sendFileSafely: el interceptor global (ResponseHttpInterceptor) hace
    // `response.data` sobre lo que devuelva este método. Como usamos @Res(), Nest jamás
    // usa este valor para armar la respuesta real (ya la mandamos a mano arriba), pero el
    // interceptor igual se ejecuta y truena con `undefined.data` si no devolvemos nada.
    return {};
  }

  @ApiOperation({ summary: 'Enrollments by Career (XLSX)' })
  @Get('careers/:careerId')
  @HttpCode(HttpStatus.OK)
  async generateEnrollmentsByCareer(
    @Res() res: Response,
    @Param('careerId', ParseUUIDPipe) careerId: string,
    @Query('schoolPeriodId') schoolPeriodId: string,
  ): Promise<any> {
    const path = await this.enrollmentReportsService.generateEnrollmentsByCareer(careerId, schoolPeriodId);
    await this.sendFileSafely(res, path);
    return {};
  }

  @ApiOperation({ summary: 'Enrollments by School Period (XLSX)' })
  @Get('school-periods/:schoolPeriodId')
  @HttpCode(HttpStatus.OK)
  async generateEnrollmentsBySchoolPeriod(@Res() res: Response, @Param('schoolPeriodId', ParseUUIDPipe) schoolPeriodId: string): Promise<any> {
    const path = await this.enrollmentReportsService.generateEnrollmentsBySchoolPeriod(schoolPeriodId);
    await this.sendFileSafely(res, path);
    return {};
  }

  @ApiOperation({ summary: 'Enrollment Details by School Period (XLSX)' })
  @Get('enrollment-details/:schoolPeriodId')
  @HttpCode(HttpStatus.OK)
  async generateEnrollmentDetailsBySchoolPeriod(@Res() res: Response, @Param('schoolPeriodId', ParseUUIDPipe) schoolPeriodId: string): Promise<any> {
    const path = await this.enrollmentReportsService.generateEnrollmentDetailsBySchoolPeriod(schoolPeriodId);
    await this.sendFileSafely(res, path);
    return {};
  }

  /**
   * `res.sendFile(path)` sin callback es "fire and forget": el método del controller
   * termina (su Promise se resuelve) ANTES de que el archivo realmente termine de
   * enviarse, y si el archivo falla a mitad de camino, el error queda sin manejar.
   * Se envuelve en una Promise real, esperando a que termine (o falle) de verdad.
   */
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
