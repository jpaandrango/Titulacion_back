import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateEnrollmentDetailStateDto } from '@modules/core/roles/secretary/dto';
import { EnrollmentDetailStateEntity } from '@modules/core/entities';
import { CatalogueEnrollmentStateEnum, CoreRepositoryEnum } from '@modules/core/shared-core/enums';

@Injectable()
export class EnrollmentDetailStatesService {
  constructor(
    @Inject(CoreRepositoryEnum.enrollmentDetailStateRepository)
    private repository: Repository<EnrollmentDetailStateEntity>,
  ) {}

  async create(payload: CreateEnrollmentDetailStateDto): Promise<EnrollmentDetailStateEntity> {
    const newEntity = this.repository.create(payload);
    newEntity.enrollmentDetailId = payload.enrollmentDetailId;
    newEntity.stateId = payload.stateId;

    return await this.repository.save(newEntity);
  }

  async removeAll(payload: EnrollmentDetailStateEntity[]): Promise<EnrollmentDetailStateEntity[]> {
    return await this.repository.softRemove(payload);
  }

  async removeRequestSent(payload: EnrollmentDetailStateEntity[]): Promise<boolean> {
    const requestSent = payload.find((s) => s.state.code === CatalogueEnrollmentStateEnum.REQUEST_SENT);
    if (requestSent) await this.repository.softRemove(requestSent);
    return true;
  }

  async removeApproved(payload: EnrollmentDetailStateEntity[]): Promise<boolean> {
    const approved = payload.find((s) => s.state.code === CatalogueEnrollmentStateEnum.APPROVED);
    if (approved) await this.repository.softRemove(approved);
    return true;
  }

  async removeRejected(payload: EnrollmentDetailStateEntity[]): Promise<boolean> {
    const rejected = payload.find((s) => s.state.code === CatalogueEnrollmentStateEnum.REJECTED);
    if (rejected) await this.repository.softRemove(rejected);
    return true;
  }
}
