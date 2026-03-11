import { TagDomain } from '../../../../core/domain/tag/entities/tag.domain';
import { TagOrmEntity } from '../entities/tag.orm-entity';

export class TagMapper {
  static toDomain(orm: TagOrmEntity): TagDomain {
    return TagDomain.reconstitute(orm.id, orm.name);
  }
}
