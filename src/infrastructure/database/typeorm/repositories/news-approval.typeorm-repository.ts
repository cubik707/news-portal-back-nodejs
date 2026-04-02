import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsApprovalOrmEntity } from '../entities/news-approval.orm-entity';
import { INewsApprovalRepository } from '../../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { NewsApproval } from '../../../../core/domain/news-approval/entities/news-approval.entity';
import { NewsApprovalMapper } from '../mappers/news-approval.mapper';

export class NewsApprovalTypeormRepository implements INewsApprovalRepository {
  constructor(
    @InjectRepository(NewsApprovalOrmEntity)
    private readonly repo: Repository<NewsApprovalOrmEntity>,
  ) {}

  async findById(id: string): Promise<NewsApproval | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['news', 'editor'],
    });
    return entity ? NewsApprovalMapper.toDomain(entity) : null;
  }

  async findByNewsId(newsId: string): Promise<NewsApproval[]> {
    const entities = await this.repo.find({
      where: { news: { id: newsId } },
      relations: ['news', 'editor'],
    });
    return entities.map((e) => NewsApprovalMapper.toDomain(e));
  }

  async save(approval: NewsApproval): Promise<NewsApproval> {
    await this.repo.update(approval.id, {
      status: approval.status,
      comment: approval.comment ?? undefined,
      reviewedAt: approval.reviewedAt,
    });
    const updated = await this.repo.findOne({
      where: { id: approval.id },
      relations: ['news', 'editor'],
    });
    return NewsApprovalMapper.toDomain(updated!);
  }
}
