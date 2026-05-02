import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AmendmentsController } from './amendments.controller';
import { CreateAmendmentUseCase } from '../../application/amendment/use-cases/create-amendment.use-case';
import { GetAmendmentsUseCase } from '../../application/amendment/use-cases/get-amendments.use-case';
import { GetMyUnseenAmendmentUseCase } from '../../application/amendment/use-cases/get-my-unseen-amendment.use-case';
import { ApproveAmendmentUseCase } from '../../application/amendment/use-cases/approve-amendment.use-case';
import { RejectAmendmentUseCase } from '../../application/amendment/use-cases/reject-amendment.use-case';
import { MarkAmendmentSeenUseCase } from '../../application/amendment/use-cases/mark-amendment-seen.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [AmendmentsController],
  providers: [
    CreateAmendmentUseCase,
    GetAmendmentsUseCase,
    GetMyUnseenAmendmentUseCase,
    ApproveAmendmentUseCase,
    RejectAmendmentUseCase,
    MarkAmendmentSeenUseCase,
  ],
})
export class AmendmentsModule {}
