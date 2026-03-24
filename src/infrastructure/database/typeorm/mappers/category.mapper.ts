import { Category } from '../../../../core/domain/category/entities/category.domain';
import { CategoryOrmEntity } from '../entities/category.orm-entity';

export class CategoryMapper {
  static toDomain(orm: CategoryOrmEntity): Category {
    return Category.reconstitute({ id: orm.id, name: orm.name });
  }
}
