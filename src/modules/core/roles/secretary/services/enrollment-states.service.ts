import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateEnrollmentStateDto } from '@modules/core/roles/secretary/dto';
import { EnrollmentStateEntity } from '@modules/core/entities';
import { CatalogueEnrollmentStateEnum, CoreRepositoryEnum } from '@modules/core/shared-core/enums';

@Injectable()
export class EnrollmentStatesService {
  constructor(
    @Inject(CoreRepositoryEnum.enrollmentStateRepository)
    private repository: Repository<EnrollmentStateEntity>,
  ) { }

  async create(payload: CreateEnrollmentStateDto): Promise<EnrollmentStateEntity> {
    const newEntity = this.repository.create(payload);
    newEntity.enrollmentId = payload.enrollmentId;
    newEntity.stateId = payload.stateId;

    return await this.repository.save(newEntity);
  }

  async removeAll(payload: EnrollmentStateEntity[]): Promise<EnrollmentStateEntity[]> {
    return await this.repository.softRemove(payload);
  }

  async removeRequestSent(payload: EnrollmentStateEntity[]): Promise<boolean> {
    const requestSent = payload.find(enrollmentState => enrollmentState.state.code === CatalogueEnrollmentStateEnum.REQUEST_SENT);
    if (requestSent) await this.repository.softRemove(requestSent);
    return true;
  }

  async removeApproved(payload: EnrollmentStateEntity[]): Promise<boolean> {
    const approved = payload.find(enrollmentState => enrollmentState.state.code === CatalogueEnrollmentStateEnum.APPROVED);
    if (approved) await this.repository.softRemove(approved);
    return true;
  }

  async removeRejected(payload: EnrollmentStateEntity[]): Promise<boolean> {
    const rejected = payload.find(enrollmentState => enrollmentState.state.code === CatalogueEnrollmentStateEnum.REJECTED);
    if (rejected) await this.repository.softRemove(rejected);
    return true;
  }
}
