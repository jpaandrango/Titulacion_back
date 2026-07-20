import { Injectable, Logger } from '@nestjs/common';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import * as qr from 'qrcode';
import { join } from 'path';
import * as fs from 'fs';
import { EnrollmentSqlService } from '@modules/core/roles/secretary/services/enrollment-sql.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFDocument } = require('pdfkit-table-ts');

/**
 * Reportes de matrícula (Secretaría).
 *
 * ⚠️ NOTA: solo se portaron los 4 reportes que el front de Secretaría consume
 * (ver EnrollmentService del front): certificado, matriculados por carrera,
 * matriculados por período lectivo y asignaturas por período lectivo.
 * El backend viejo tenía además "generateEnrollmentApplication" y
 * "generateAcademicRecordByStudent" (récord académico), que no se portaron
 * porque no forman parte de este módulo y dependen de CareersService (otro rol).
 *
 * ⚠️ Dependencias nuevas agregadas a package.json: "pdfkit-table-ts" y "qrcode".
 * Ejecutar `npm install` tras aplicar este cambio.
 */
@Injectable()
export class EnrollmentReportsService {
  private readonly logger = new Logger(EnrollmentReportsService.name);
  private background = join(process.cwd(), 'storage/resources/reports/layouts/background_certificate.png');
  private outputDir = join(process.cwd(), 'storage/private/uploads/reports/enrollments');

  constructor(private readonly enrollmentSqlService: EnrollmentSqlService) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateEnrollmentCertificate(res: any, id: string) {
    const enrollment = await this.enrollmentSqlService.findEnrollmentCertificateByEnrollment(id);

    if (!enrollment) {
      res.status(404).json({ message: 'Matrícula no encontrada' });
      return;
    }

    let pdfBuffer: Buffer;

    try {
      // Se arma el PDF COMPLETO en memoria (nunca se conecta el doc directo a `res`).
      // Esto evita por completo la categoría de bugs de streaming que veníamos
      // arrastrando: pdfkit-table-ts sigue emitiendo datos de forma asíncrona incluso
      // después de que la petición HTTP ya se dio por terminada, y eso chocaba con el
      // ciclo de vida de NestJS (ERR_STREAM_WRITE_AFTER_END, luego ERR_HTTP_HEADERS_SENT
      // al intentar responder dos veces). Con este patrón, `res` no se toca para nada
      // hasta que el PDF esté 100% listo y validado en memoria.
      pdfBuffer = await this.buildCertificatePdf(enrollment);
    } catch (error) {
      this.logger.error(`Error generando certificado de matrícula ${id}: ${error?.message ?? error}`, error?.stack);
      res.status(500).json({ error: 'Error', message: 'No se pudo generar el certificado de matrícula' });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="certificado-matricula-${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  }

  private buildCertificatePdf(enrollment: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        align: 'center',
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error: Error) => reject(error));

      this.drawCertificate(doc, enrollment)
        .then(() => doc.end())
        .catch((error) => {
          reject(error);
          try {
            doc.end();
          } catch {
            // ya podría estar cerrado, ignorar
          }
        });
    });
  }

  private async drawCertificate(doc: any, enrollment: any): Promise<void> {
    const textX = 50;
    const textY = 120;

    const width = doc.page.width;
    const height = doc.page.height;

    if (fs.existsSync(this.background)) {
      doc.image(this.background, 0, 0, { width, height });
    }

    const enrollmentCode = `${enrollment.schoolPeriod.shortName ?? enrollment.schoolPeriod.code}-${enrollment.career.acronym}-${enrollment.student.user.identification}`;
    const text = `Por medio del presente, en mi calidad de Coordinadora del Centro de Inglés Yavirac, CERTIFICO que, de conformidad con el Sistema Integral Académico, el/la estudiante  ${enrollment.student.user.name} ${enrollment.student.user.lastname} con el número de identificación ${enrollment.student.user.identification}, se encuentra legalmente matriculado/a, en el ciclo ${enrollment.schoolPeriod.name}, en el siguiente nivel:`;
    const currentDate = new Date();
    const day = format(currentDate, 'd', { locale: es });
    const formattedDate = format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: es });
    const fechaCompleta = `${formattedDate.replace('dd', day)}`;

    doc.moveDown(3);
    doc.font('Helvetica-Bold').fontSize(18).text('CERTIFICADO DE MATRÍCULA', textX + 110);
    doc.moveDown();
    doc.font('Helvetica');
    doc.fontSize(11);
    doc.text(`Quito, ${fechaCompleta}`, textX + 330);
    doc.moveDown();
    doc.font('Helvetica-Bold');
    doc.fontSize(11);
    doc.text('MATRICULA:  ' + enrollmentCode, textX);

    doc.font('Helvetica');
    doc.fontSize(11);
    doc.lineGap(6);
    doc.text(text, textX, textY + 130, {
      width: 460,
      align: 'justify',
    });
    doc.moveDown(2);

    const rows: any[] = [];

    enrollment.enrollmentDetails.forEach((enrollmentDetail: any) => {
      rows.push([
        enrollmentDetail.subject.code,
        enrollmentDetail.subject.name,
        enrollmentDetail.subject.academicPeriod.name,
        String(enrollmentDetail.number ?? ''),
        enrollmentDetail.parallel?.name ?? '',
        enrollmentDetail.workday?.name ?? '',
        enrollmentDetail.enrollmentDetailStates?.[0]?.state?.name ?? '',
      ]);
    });

    const table = {
      headers: ['Código', 'Asignatura', 'Nivel', 'Num.', 'Paralelo', 'Horario', 'Estado'],
      rows,
    };

    // FIX: antes había 7 headers pero solo 6 columnsSize — el desfase hacía que
    // pdfkit-table-ts calculara el ancho de una columna inexistente y tirara
    // "unsupported number: NaN". Ahora hay exactamente 7 valores, uno por columna.
    await doc.table(table, { align: 'center', columnsSize: [50, 145, 45, 30, 45, 65, 90] });

    // QR opcional — puntero a la propia matrícula (se genera pero, por ahora, no se
    // inserta visualmente en el PDF; queda pendiente si se quiere agregar la imagen).
    const qrData = `enrollment:${enrollment.id}`;
    await qr.toBuffer(qrData, { errorCorrectionLevel: 'H', type: 'png', margin: 1, scale: 6 });

    doc.font('Helvetica').fontSize(11).text('MSc. LORENA MALDONADO MORENO', textX + 135, textY + 575);
    doc.font('Helvetica-Bold').fontSize(10).text('COORDINADORA DEL CENTRO DE INGLÉS YAVIRAC', textX + 110, textY + 595);
    doc.moveDown();

    const oldBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc
      .fontSize(7)
      .text(`Dir. García Moreno S4-35 y Ambato, TELF: +593 99 550 6245 MAIL: yavirac@yavirac.edu.ec`, 50, doc.page.height - oldBottomMargin / 2 - 40, {
        align: 'center',
      });
  }

  async generateEnrollmentsByCareer(careerId: string, schoolPeriodId: string): Promise<string> {
    const data = await this.enrollmentSqlService.findEnrollmentsByCareer(careerId, schoolPeriodId);
    return this.writeXlsx(data);
  }

  async generateEnrollmentsBySchoolPeriod(schoolPeriodId: string): Promise<string> {
    const data = await this.enrollmentSqlService.findEnrollmentsBySchoolPeriod(schoolPeriodId);
    return this.writeXlsx(data);
  }

  async generateEnrollmentDetailsBySchoolPeriod(schoolPeriodId: string): Promise<string> {
    const data = await this.enrollmentSqlService.findEnrollmentDetailsBySchoolPeriod(schoolPeriodId);
    return this.writeXlsx(data);
  }

  private writeXlsx(data: any[]): string {
    const newWorkbook = XLSX.utils.book_new();
    const newSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Estudiantes');
    const path = join(this.outputDir, Date.now() + '.xlsx');
    XLSX.writeFile(newWorkbook, path);
    return path;
  }
}
