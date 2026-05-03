import { Inject, Injectable } from '@nestjs/common';
import { Amendment } from '../../../core/domain/amendment/entities/amendment.domain';
import {
  type IAmendmentRepository,
  AMENDMENT_REPOSITORY,
} from '../../../core/domain/amendment/repositories/amendment.repository.interface';
import { AmendmentNotFoundException } from '../../../core/domain/amendment/exceptions/amendment-not-found.exception';
import { AmendmentNotPendingException } from '../../../core/domain/amendment/exceptions/amendment-not-pending.exception';
import { AmendmentStatus } from '../../../core/shared/enums/amendment-status.enum';

export interface ApproveAmendmentInput {
  amendmentId: string;
  reviewedBy: string;
}

@Injectable()
export class ApproveAmendmentUseCase {
  constructor(
    @Inject(AMENDMENT_REPOSITORY)
    private readonly amendmentRepository: IAmendmentRepository,
  ) {}

  async execute(input: ApproveAmendmentInput): Promise<Amendment> {
    const amendment = await this.amendmentRepository.findById(input.amendmentId);
    if (!amendment) throw new AmendmentNotFoundException(input.amendmentId);
    if (amendment.status !== AmendmentStatus.PENDING) throw new AmendmentNotPendingException();

    amendment.approve(input.reviewedBy);
    return this.amendmentRepository.save(amendment);
  }
}
