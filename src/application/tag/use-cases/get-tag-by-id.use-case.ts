import { Inject, Injectable } from '@nestjs/common';
import { Tag } from '../../../core/domain/tag/entities/tag.domain';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../../core/domain/tag/repositories/tag.repository.interface';
import { TagNotFoundException } from '../../../core/domain/tag/exceptions/tag-not-found.exception';

@Injectable()
export class GetTagByIdUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new TagNotFoundException(id);
    return tag;
  }
}
