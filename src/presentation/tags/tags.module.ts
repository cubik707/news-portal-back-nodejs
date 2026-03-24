import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { TagsController } from './tags.controller';
import { CreateTagUseCase } from '../../application/tag/use-cases/create-tag.use-case';
import { GetAllTagsUseCase } from '../../application/tag/use-cases/get-all-tags.use-case';
import { GetTagByIdUseCase } from '../../application/tag/use-cases/get-tag-by-id.use-case';
import { GetLastThreeTagsUseCase } from '../../application/tag/use-cases/get-last-three-tags.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [TagsController],
  providers: [CreateTagUseCase, GetAllTagsUseCase, GetTagByIdUseCase, GetLastThreeTagsUseCase],
})
export class TagsModule {}
