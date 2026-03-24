import { Inject, Injectable } from '@nestjs/common';
import { Tag } from '../../../core/domain/tag/entities/tag.domain';
import {
  type ITagRepository,
  TAG_REPOSITORY,
} from '../../../core/domain/tag/repositories/tag.repository.interface';

@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(name: string): Promise<Tag> {
    const tag = Tag.create(name);
    return this.tagRepository.save(tag);
  }
}
