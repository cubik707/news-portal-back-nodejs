import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { NewsApprovalOrmEntity } from '../entities/news-approval.orm-entity';
import { INewsApprovalRepository } from '../../../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { NewsApproval } from '../../../../core/domain/news-approval/entities/news-approval.entity';
import { NewsApprovalMapper } from '../mappers/news-approval.mapper';
import { ApprovalStatus } from '../../../../core/shared/enums/approval-status.enum';

export class NewsApprovalTypeormRepository implements INewsApprovalRepository {
  constructor(
    @InjectRepository(NewsApprovalOrmEntity)
    private readonly repo: Repository<NewsApprovalOrmEntity>,
  ) {}

  private get relations() {
    return ['news', 'editor', 'submittedToAdmin', 'admin'];
  }

  async findById(id: string): Promise<NewsApproval | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    return entity ? NewsApprovalMapper.toDomain(entity) : null;
  }

  async findByNewsId(newsId: string): Promise<NewsApproval[]> {
    const entities = await this.repo.find({
      where: { news: { id: newsId } },
      relations: this.relations,
      order: { createdAt: 'DESC' },
    });
    return entities.map(NewsApprovalMapper.toDomain);
  }

  async findPendingForAdmin(adminId: string): Promise<NewsApproval[]> {
    const entities = await this.repo.find({
      where: [
        { status: ApprovalStatus.pending, submittedToAdmin: IsNull() },
        { status: ApprovalStatus.pending, submittedToAdmin: { id: adminId } },
      ],
      relations: this.relations,
      order: { createdAt: 'DESC' },
    });
    return entities.map(NewsApprovalMapper.toDomain);
  }

  async findByEditorId(editorId: string): Promise<NewsApproval[]> {
    const entities = await this.repo.find({
      where: { editor: { id: editorId } },
      relations: this.relations,
      order: { createdAt: 'DESC' },
    });
    return entities.map(NewsApprovalMapper.toDomain);
  }

  async findActiveForNews(newsId: string): Promise<NewsApproval | null> {
    const entity = await this.repo.findOne({
      where: { news: { id: newsId }, status: ApprovalStatus.pending },
      relations: this.relations,
    });
    return entity ? NewsApprovalMapper.toDomain(entity) : null;
  }

  async countUnseenForAdmin(adminId: string): Promise<number> {
    return this.repo.count({
      where: [
        { status: ApprovalStatus.pending, submittedToAdmin: IsNull(), seenByAdminAt: IsNull() },
        { status: ApprovalStatus.pending, submittedToAdmin: { id: adminId }, seenByAdminAt: IsNull() },
      ],
    });
  }

  async countUnseenForEditor(editorId: string): Promise<number> {
    return this.repo.count({
      where: [
        { editor: { id: editorId }, status: ApprovalStatus.approved, seenByEditorAt: IsNull() },
        { editor: { id: editorId }, status: ApprovalStatus.rejected, seenByEditorAt: IsNull() },
      ],
    });
  }

  async insert(approval: NewsApproval): Promise<NewsApproval> {
    const entity = this.repo.create({
      id: approval.id,
      news: { id: approval.newsId },
      editor: { id: approval.editorId },
      submittedToAdmin: approval.submittedToAdminId ? { id: approval.submittedToAdminId } : null,
      admin: null,
      status: approval.status,
      comment: approval.comment,
      seenByAdminAt: approval.seenByAdminAt,
      seenByEditorAt: approval.seenByEditorAt,
      reviewedAt: approval.reviewedAt,
    });
    await this.repo.save(entity);
    const saved = await this.repo.findOne({ where: { id: approval.id }, relations: this.relations });
    return NewsApprovalMapper.toDomain(saved!);
  }

  async save(approval: NewsApproval): Promise<NewsApproval> {
    await this.repo.update(approval.id, {
      admin: approval.adminId ? { id: approval.adminId } : undefined,
      status: approval.status,
      comment: approval.comment ?? undefined,
      seenByAdminAt: approval.seenByAdminAt ?? undefined,
      seenByEditorAt: approval.seenByEditorAt ?? undefined,
      reviewedAt: approval.reviewedAt ?? undefined,
    });
    const updated = await this.repo.findOne({ where: { id: approval.id }, relations: this.relations });
    return NewsApprovalMapper.toDomain(updated!);
  }
}
