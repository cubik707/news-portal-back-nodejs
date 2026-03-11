import { NewsDomain } from '../../../../core/domain/news/entities/news.domain';
import { NewsOrmEntity } from '../entities/news.orm-entity';
import { UserMapper } from './user.mapper';
import { CategoryMapper } from './category.mapper';
import { TagMapper } from './tag.mapper';

export class NewsMapper {
  static toDomain(orm: NewsOrmEntity): NewsDomain {
    const domain = new NewsDomain();
    domain.id = orm.id;
    domain.title = orm.title;
    domain.content = orm.content;
    domain.image = orm.image ?? undefined;
    domain.status = orm.status;
    domain.publishedAt = orm.publishedAt ?? undefined;
    domain.scheduledAt = orm.scheduledAt ?? undefined;
    domain.createdAt = orm.createdAt;
    domain.updatedAt = orm.updatedAt;
    domain.author = orm.author ? UserMapper.toDomain(orm.author) : undefined!;
    domain.category = orm.category
      ? CategoryMapper.toDomain(orm.category)
      : undefined!;
    domain.tags = (orm.tags ?? []).map(TagMapper.toDomain);
    return domain;
  }
}
