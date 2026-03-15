import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { IUserRepository } from '../../../../core/domain/user/repositories/user.repository.interface';
import { User } from '../../../../core/domain/user/entities/user.domain';
import { UserRole } from '../../../../core/shared/enums/user-role.enum';
import { UserMapper } from '../mappers/user.mapper';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { UserInfoOrmEntity } from '../entities/user-info.orm-entity';
import { InjectRepository as InjectRepo } from '@nestjs/typeorm';
import { Category } from '../../../../core/domain/category/entities/category.domain';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { CategoryMapper } from '../mappers/category.mapper';

export class UserTypeormRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
    @InjectRepo(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
    @InjectRepo(CategoryOrmEntity)
    private readonly categoryRepo: Repository<CategoryOrmEntity>,
  ) {}

  private get relations(): string[] {
    return ['roles', 'userInfo'];
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find({ relations: this.relations });
    return entities.map(UserMapper.toDomain);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { username }, relations: this.relations });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email }, relations: this.relations });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<User> {
    const entity = new UserOrmEntity();
    entity.id = user.id;
    entity.username = user.username;
    entity.email = user.email.getValue();
    entity.passwordHash = user.passwordHash.getValue();
    entity.isApproved = user.isApproved;
    entity.roles = [];

    const saved = await this.repo.save(entity);

    const userInfo = new UserInfoOrmEntity();
    userInfo.userId = saved.id;
    userInfo.user = saved;
    userInfo.lastName = user.lastName;
    userInfo.firstName = user.firstName;
    userInfo.surname = user.surname ?? '';
    userInfo.position = user.position ?? '';
    userInfo.department = user.department ?? '';
    userInfo.avatarUrl = user.avatarUrl ?? '';
    saved.userInfo = userInfo;

    const withInfo = await this.repo.save(saved);
    const found = await this.repo.findOne({
      where: { id: withInfo.id },
      relations: this.relations,
    });
    return UserMapper.toDomain(found!);
  }

  async update(id: string, user: User): Promise<User> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    if (!entity) throw new Error(`User ${id} not found`);

    entity.username = user.username;
    entity.email = user.email.getValue();
    entity.passwordHash = user.passwordHash.getValue();
    entity.isApproved = user.isApproved;

    if (entity.userInfo) {
      entity.userInfo.lastName = user.lastName;
      entity.userInfo.firstName = user.firstName;
      entity.userInfo.surname = user.surname ?? '';
      entity.userInfo.position = user.position ?? '';
      entity.userInfo.department = user.department ?? '';
      entity.userInfo.avatarUrl = user.avatarUrl ?? '';
    }

    await this.repo.save(entity);
    const updated = await this.repo.findOne({ where: { id }, relations: this.relations });
    return UserMapper.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async approve(id: string): Promise<User> {
    await this.repo.update(id, { isApproved: true });
    const approved = await this.repo.findOne({ where: { id }, relations: this.relations });
    return UserMapper.toDomain(approved!);
  }

  async assignRole(id: string, role: UserRole): Promise<User> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    if (!entity) throw new Error(`User ${id} not found`);

    const roleEntity = await this.roleRepo.findOne({ where: { name: role } });
    if (!roleEntity) throw new Error(`Role ${role} not found`);

    if (!entity.roles.some((r) => r.name === role)) {
      entity.roles.push(roleEntity);
      await this.repo.save(entity);
    }

    const withRole = await this.repo.findOne({ where: { id }, relations: this.relations });
    return UserMapper.toDomain(withRole!);
  }

  async removeRole(id: string, role: UserRole): Promise<User> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    if (!entity) throw new Error(`User ${id} not found`);

    entity.roles = entity.roles.filter((r) => r.name !== role);
    await this.repo.save(entity);

    const withoutRole = await this.repo.findOne({ where: { id }, relations: this.relations });
    return UserMapper.toDomain(withoutRole!);
  }

  async findSubscriptions(userId: string): Promise<Category[]> {
    const entity = await this.repo.findOne({
      where: { id: userId },
      relations: ['subscribedCategories'],
    });
    if (!entity) return [];
    return entity.subscribedCategories.map(CategoryMapper.toDomain);
  }

  async addSubscription(userId: string, categoryId: string): Promise<void> {
    const entity = await this.repo.findOne({
      where: { id: userId },
      relations: ['subscribedCategories'],
    });
    if (!entity) throw new Error(`User ${userId} not found`);

    const alreadySubscribed = entity.subscribedCategories.some((c) => c.id === categoryId);
    if (!alreadySubscribed) {
      const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
      if (category) {
        entity.subscribedCategories.push(category);
        await this.repo.save(entity);
      }
    }
  }

  async removeSubscription(userId: string, categoryId: string): Promise<void> {
    const entity = await this.repo.findOne({
      where: { id: userId },
      relations: ['subscribedCategories'],
    });
    if (!entity) throw new Error(`User ${userId} not found`);

    entity.subscribedCategories = entity.subscribedCategories.filter((c) => c.id !== categoryId);
    await this.repo.save(entity);
  }
}
