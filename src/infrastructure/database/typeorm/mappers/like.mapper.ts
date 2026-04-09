import { Like } from '../../../../core/domain/like/entities/like.domain';
import { LikeOrmEntity } from '../entities/like.orm-entity';

export class LikeMapper {
  static toDomain(orm: LikeOrmEntity): Like {
    return Like.reconstitute({
      id: orm.id,
      newsId: orm.newsId,
      userId: orm.userId,
      createdAt: orm.createdAt,
    });
  }
}
