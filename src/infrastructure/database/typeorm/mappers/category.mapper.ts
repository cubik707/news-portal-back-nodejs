import { CategoryDomain } from '../../../../core/domain/category/entities/category.domain';
import { CategoryOrmEntity } from '../entities/category.orm-entity';

export class CategoryMapper {
  static toDomain(orm: CategoryOrmEntity): CategoryDomain {
    const domain = new CategoryDomain();
    domain.id = orm.id;
    domain.name = orm.name;
    return domain;
  }
}
