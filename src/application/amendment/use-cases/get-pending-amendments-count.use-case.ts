import { Inject, Injectable } from '@nestjs/common';
import {
  type IAmendmentRepository,
  AMENDMENT_REPOSITORY,
} from '../../../core/domain/amendment/repositories/amendment.repository.interface';

@Injectable()
export class GetPendingAmendmentsCountUseCase {
  constructor(
    @Inject(AMENDMENT_REPOSITORY)
    private readonly amendmentRepository: IAmendmentRepository,
  ) {}

  async execute(): Promise<number> {
    return this.amendmentRepository.countPending();
  }
}
