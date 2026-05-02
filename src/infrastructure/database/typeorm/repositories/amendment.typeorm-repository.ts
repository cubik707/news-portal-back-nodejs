import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmendmentOrmEntity } from '../entities/amendment.orm-entity';
import { IAmendmentRepository } from '../../../../core/domain/amendment/repositories/amendment.repository.interface';
import { Amendment } from '../../../../core/domain/amendment/entities/amendment.domain';
import { AmendmentMapper } from '../mappers/amendment.mapper';
import { AmendmentStatus } from '../../../../core/shared/enums/amendment-status.enum';

export class AmendmentTypeormRepository implements IAmendmentRepository {
  constructor(
    @InjectRepository(AmendmentOrmEntity)
    private readonly repo: Repository<AmendmentOrmEntity>,
  ) {}

  private get relations(): string[] {
    return ['user', 'user.userInfo'];
  }

  async save(amendment: Amendment): Promise<Amendment> {
    const existing = await this.repo.findOne({ where: { id: amendment.id } });

    if (!existing) {
      const entity = this.repo.create({
        id: amendment.id,
        userId: amendment.userId,
        comment: amendment.comment,
        status: amendment.status,
        rejectionReason: amendment.rejectionReason,
        seenByUser: amendment.seenByUser,
        reviewedAt: amendment.reviewedAt,
        reviewedBy: amendment.reviewedBy,
      });
      await this.repo.save(entity);
    } else {
      await this.repo.update(amendment.id, {
        status: amendment.status,
        rejectionReason: amendment.rejectionReason ?? undefined,
        seenByUser: amendment.seenByUser,
        reviewedAt: amendment.reviewedAt ?? undefined,
        reviewedBy: amendment.reviewedBy ?? undefined,
      });
    }

    const saved = await this.repo.findOne({
      where: { id: amendment.id },
      relations: this.relations,
    });
    return AmendmentMapper.toDomain(saved!);
  }

  async findById(id: string): Promise<Amendment | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    return entity ? AmendmentMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Amendment[]> {
    const entities = await this.repo.find({
      where: { userId },
      relations: this.relations,
      order: { createdAt: 'DESC' },
    });
    return entities.map(AmendmentMapper.toDomain);
  }

  async findAll(): Promise<Amendment[]> {
    // QueryBuilder required: TypeORM's `order` option cannot express CASE expressions
    const entities = await this.repo
      .createQueryBuilder('amendment')
      .leftJoinAndSelect('amendment.user', 'user')
      .leftJoinAndSelect('user.userInfo', 'userInfo')
      .orderBy(
        `CASE WHEN amendment.status = '${AmendmentStatus.PENDING}' THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('amendment.created_at', 'DESC')
      .getMany();
    return entities.map(AmendmentMapper.toDomain);
  }

  async findUnseenResolvedByUserId(userId: string): Promise<Amendment | null> {
    const entity = await this.repo.findOne({
      where: [
        { userId, status: AmendmentStatus.APPROVED, seenByUser: false },
        { userId, status: AmendmentStatus.REJECTED, seenByUser: false },
      ],
      order: { reviewedAt: 'DESC' },
      relations: this.relations,
    });
    return entity ? AmendmentMapper.toDomain(entity) : null;
  }

  async findPendingByUserId(userId: string): Promise<Amendment | null> {
    const entity = await this.repo.findOne({
      where: { userId, status: AmendmentStatus.PENDING },
    });
    return entity ? AmendmentMapper.toDomain(entity) : null;
  }
}
