import { Inject, Injectable } from '@nestjs/common';
import { Amendment } from '../../../core/domain/amendment/entities/amendment.domain';
import {
  type IAmendmentRepository,
  AMENDMENT_REPOSITORY,
} from '../../../core/domain/amendment/repositories/amendment.repository.interface';

@Injectable()
export class GetMyUnseenAmendmentUseCase {
  constructor(
    @Inject(AMENDMENT_REPOSITORY)
    private readonly amendmentRepository: IAmendmentRepository,
  ) {}

  async execute(userId: string): Promise<Amendment | null> {
    return this.amendmentRepository.findUnseenResolvedByUserId(userId);
  }
}
