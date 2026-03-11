import { CategoryDomain } from '../../../../core/domain/category/entities/category.domain';
import { CategoryOrmEntity } from '../entities/category.orm-entity';

export class CategoryMapper {
  static toDomain(orm: CategoryOrmEntity): CategoryDomain {
    return CategoryDomain.reconstitute(orm.id, orm.name);
  }
}
