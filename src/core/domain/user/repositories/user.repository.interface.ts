import { UserRole } from '../../../shared/enums/user-role.enum';
import { UserDomain } from '../entities/user.domain';

export interface IUserRepository {
  findAll(): Promise<UserDomain[]>;
  findById(id: number): Promise<UserDomain | null>;
  findByUsername(username: string): Promise<UserDomain | null>;
  findByEmail(email: string): Promise<UserDomain | null>;
  save(user: Partial<UserDomain>): Promise<UserDomain>;
  update(id: number, data: Partial<UserDomain>): Promise<UserDomain>;
  delete(id: number): Promise<void>;
  approve(id: number): Promise<UserDomain>;
  assignRole(id: number, role: UserRole): Promise<UserDomain>;
  removeRole(id: number, role: UserRole): Promise<UserDomain>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
