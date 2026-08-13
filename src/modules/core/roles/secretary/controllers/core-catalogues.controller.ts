import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@auth/decorators';
import { CoreCataloguesService } from '@modules/core/roles/secretary/services/core-catalogues.service';
import { CatalogueCoreTypeEnum } from '@modules/core/shared-core/enums';
import { ResponseHttpInterface } from '@utils/interfaces';

/**
 * Expone por HTTP los catálogos de `core.catalogues` (paralelo, jornada, tipo de
 * matrícula, estado académico, período académico, estado de matrícula, etc.).
 *
 * Es un endpoint genérico de catálogos de 'core', no exclusivo de Secretaría — si otros roles lo
 * empiezan a necesitar, valdría la pena moverlo a `shared-core`.
 */
@ApiTags('Core Catalogues')
@Auth()
@Controller('core/catalogues')
export class CoreCataloguesController {
  constructor(private readonly coreCataloguesService: CoreCataloguesService) { }

  @ApiOperation({ summary: 'Find Core Catalogues By Type' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findByType(@Query('type') type: string): Promise<ResponseHttpInterface> {
    // El front manda la KEY del enum (ej. 'academic_period'), no el valor real de BD
    // (ej. 'ACADEMIC_PERIOD') — se traduce acá para no exigirle ese detalle al front.
    const realType = (CatalogueCoreTypeEnum as Record<string, string>)[type] ?? type;

    const data = await this.coreCataloguesService.findByType(realType);

    return {
      data,
      message: 'Catálogos',
      title: 'Consultado',
    };
  }
}
