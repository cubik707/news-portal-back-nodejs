import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { IUserRepository } from '../../../../core/domain/user/repositories/user.repository.interface';
import { UserDomain } from '../../../../core/domain/user/entities/user.domain';
import { UserRole } from '../../../../core/shared/enums/user-role.enum';
import { UserMapper } from '../mappers/user.mapper';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { UserInfoOrmEntity } from '../entities/user-info.orm-entity';
import { InjectRepository as InjectRepo } from '@nestjs/typeorm';

export class UserTypeormRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
    @InjectRepo(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
  ) {}

  private get relations(): string[] {
    return ['roles', 'userInfo'];
  }

  async findAll(): Promise<UserDomain[]> {
    const entities = await this.repo.find({ relations: this.relations });
    return entities.map(UserMapper.toDomain);
  }

  async findById(id: number): Promise<UserDomain | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<UserDomain | null> {
    const entity = await this.repo.findOne({ where: { username }, relations: this.relations });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<UserDomain | null> {
    const entity = await this.repo.findOne({ where: { email }, relations: this.relations });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async save(user: UserDomain): Promise<UserDomain> {
    const entity = new UserOrmEntity();
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

  async update(id: number, user: UserDomain): Promise<UserDomain> {
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

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async approve(id: number): Promise<UserDomain> {
    await this.repo.update(id, { isApproved: true });
    const approved = await this.repo.findOne({ where: { id }, relations: this.relations });
    return UserMapper.toDomain(approved!);
  }

  async assignRole(id: number, role: UserRole): Promise<UserDomain> {
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

  async removeRole(id: number, role: UserRole): Promise<UserDomain> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    if (!entity) throw new Error(`User ${id} not found`);

    entity.roles = entity.roles.filter((r) => r.name !== role);
    await this.repo.save(entity);

    const withoutRole = await this.repo.findOne({ where: { id }, relations: this.relations });
    return UserMapper.toDomain(withoutRole!);
  }
}
