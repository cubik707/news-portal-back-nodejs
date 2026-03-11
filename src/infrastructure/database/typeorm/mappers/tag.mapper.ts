import { TagDomain } from '../../../../core/domain/tag/entities/tag.domain';
import { TagOrmEntity } from '../entities/tag.orm-entity';

export class TagMapper {
  static toDomain(orm: TagOrmEntity): TagDomain {
    const domain = new TagDomain();
    domain.id = orm.id;
    domain.name = orm.name;
    return domain;
  }
}
