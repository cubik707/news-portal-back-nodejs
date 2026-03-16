import { Tag } from '../../../core/domain/tag/entities/tag.domain';

export class TagResponseDto {
  id!: string;
  name!: string;

  static fromDomain(this: void, tag: Tag): TagResponseDto {
    const dto = new TagResponseDto();
    dto.id = tag.id;
    dto.name = tag.name;
    return dto;
  }
}
