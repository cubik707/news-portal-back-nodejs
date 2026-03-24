import { News } from '../../../../core/domain/news/entities/news.domain';
import { NewsOrmEntity } from '../entities/news.orm-entity';
import { UserMapper } from './user.mapper';
import { CategoryMapper } from './category.mapper';
import { TagMapper } from './tag.mapper';

export class NewsMapper {
  static toDomain(orm: NewsOrmEntity): News {
    return News.reconstitute({
      id: orm.id,
      title: orm.title,
      content: orm.content,
      image: orm.image || undefined,
      status: orm.status,
      publishedAt: orm.publishedAt || undefined,
      scheduledAt: orm.scheduledAt || undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      author: UserMapper.toDomain(orm.author),
      category: CategoryMapper.toDomain(orm.category),
      tags: (orm.tags ?? []).map(TagMapper.toDomain),
    });
  }
}
