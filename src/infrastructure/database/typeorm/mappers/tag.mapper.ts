import { Tag } from '../../../../core/domain/tag/entities/tag.domain';
import { TagOrmEntity } from '../entities/tag.orm-entity';

export class TagMapper {
  static toDomain(orm: TagOrmEntity): Tag {
    return Tag.reconstitute({ id: orm.id, name: orm.name });
  }
}
