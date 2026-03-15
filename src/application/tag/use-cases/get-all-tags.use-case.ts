import { Inject, Injectable } from '@nestjs/common';
import { Tag } from '../../../core/domain/tag/entities/tag.domain';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../../core/domain/tag/repositories/tag.repository.interface';

@Injectable()
export class GetAllTagsUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(): Promise<Tag[]> {
    return this.tagRepository.findAll();
  }
}
