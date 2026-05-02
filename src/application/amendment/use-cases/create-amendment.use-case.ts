import { Inject, Injectable } from '@nestjs/common';
import { Amendment } from '../../../core/domain/amendment/entities/amendment.domain';
import {
  type IAmendmentRepository,
  AMENDMENT_REPOSITORY,
} from '../../../core/domain/amendment/repositories/amendment.repository.interface';
import { AmendmentAlreadyPendingException } from '../../../core/domain/amendment/exceptions/amendment-already-pending.exception';

export interface CreateAmendmentInput {
  userId: string;
  comment: string;
}

@Injectable()
export class CreateAmendmentUseCase {
  constructor(
    @Inject(AMENDMENT_REPOSITORY)
    private readonly amendmentRepository: IAmendmentRepository,
  ) {}

  async execute(input: CreateAmendmentInput): Promise<Amendment> {
    const existing = await this.amendmentRepository.findPendingByUserId(input.userId);
    if (existing) throw new AmendmentAlreadyPendingException();

    const amendment = Amendment.create({
      userId: input.userId,
      comment: input.comment,
    });
    return this.amendmentRepository.save(amendment);
  }
}
