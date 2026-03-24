import { Category } from '../../category/entities/category.domain';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { User } from '../entities/user.domain';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(id: string, user: User): Promise<User>;
  delete(id: string): Promise<void>;
  approve(id: string): Promise<User>;
  assignRole(id: string, role: UserRole): Promise<User>;
  removeRole(id: string, role: UserRole): Promise<User>;
  findSubscriptions(userId: string): Promise<Category[]>;
  addSubscription(userId: string, categoryId: string): Promise<void>;
  removeSubscription(userId: string, categoryId: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
