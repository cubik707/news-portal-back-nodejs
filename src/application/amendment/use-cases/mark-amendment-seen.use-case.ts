import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import {
  type IAmendmentRepository,
  AMENDMENT_REPOSITORY,
} from '../../../core/domain/amendment/repositories/amendment.repository.interface';
import { AmendmentNotFoundException } from '../../../core/domain/amendment/exceptions/amendment-not-found.exception';

export interface MarkAmendmentSeenInput {
  amendmentId: string;
  userId: string;
}

@Injectable()
export class MarkAmendmentSeenUseCase {
  constructor(
    @Inject(AMENDMENT_REPOSITORY)
    private readonly amendmentRepository: IAmendmentRepository,
  ) {}

  async execute(input: MarkAmendmentSeenInput): Promise<void> {
    const amendment = await this.amendmentRepository.findById(input.amendmentId);
    if (!amendment) throw new AmendmentNotFoundException(input.amendmentId);
    if (amendment.userId !== input.userId)
      throw new ForbiddenException('Amendment does not belong to this user');

    amendment.markSeen();
    await this.amendmentRepository.save(amendment);
  }
}
