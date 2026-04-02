import { Comment } from '../../../../core/domain/comment/entities/comment.domain';
import { CommentOrmEntity } from '../entities/comment.orm-entity';
import { UserMapper } from './user.mapper';

export class CommentMapper {
  static toDomain(orm: CommentOrmEntity): Comment {
    return Comment.reconstitute({
      id: orm.id,
      content: orm.content,
      author: UserMapper.toDomain(orm.author),
      newsId: orm.newsId,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      editedAt: orm.editedAt ?? undefined,
    });
  }
}
