import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LikeOrmEntity } from '../entities/like.orm-entity';
import { ILikeRepository } from '../../../../core/domain/like/repositories/like.repository.interface';
import { Like } from '../../../../core/domain/like/entities/like.domain';
import { LikeMapper } from '../mappers/like.mapper';

export class LikeTypeormRepository implements ILikeRepository {
  constructor(
    @InjectRepository(LikeOrmEntity)
    private readonly repo: Repository<LikeOrmEntity>,
  ) {}

  async save(like: Like): Promise<Like> {
    const entity = this.repo.create({
      newsId: like.newsId,
      userId: like.userId,
    });
    const saved = await this.repo.save(entity);
    return LikeMapper.toDomain(saved);
  }

  async delete(newsId: string, userId: string): Promise<void> {
    await this.repo.delete({ newsId, userId });
  }

  async findByNewsAndUser(newsId: string, userId: string): Promise<Like | null> {
    const entity = await this.repo.findOne({ where: { newsId, userId } });
    return entity ? LikeMapper.toDomain(entity) : null;
  }

  async findByUser(userId: string): Promise<Like[]> {
    const entities = await this.repo.find({ where: { userId } });
    return entities.map((e) => LikeMapper.toDomain(e));
  }

  async countByNewsId(newsId: string): Promise<number> {
    return this.repo.count({ where: { newsId } });
  }

  async countsByNewsIds(newsIds: string[]): Promise<Record<string, number>> {
    if (newsIds.length === 0) return {};

    const rows = await this.repo
      .createQueryBuilder('l')
      .select('l.news_id', 'newsId')
      .addSelect('COUNT(*)', 'count')
      .where('l.news_id IN (:...newsIds)', { newsIds })
      .groupBy('l.news_id')
      .getRawMany<{ newsId: string; count: string }>();

    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.newsId] = parseInt(row.count, 10);
    }
    return result;
  }

  async findLikedNewsIds(userId: string, newsIds: string[]): Promise<string[]> {
    if (newsIds.length === 0) return [];

    const entities = await this.repo.find({
      where: { userId, newsId: In(newsIds) },
      select: ['newsId'],
    });
    return entities.map((e) => e.newsId);
  }
}
