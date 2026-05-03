import { Amendment } from '../entities/amendment.domain';

export interface IAmendmentRepository {
  save(amendment: Amendment): Promise<Amendment>;
  findById(id: string): Promise<Amendment | null>;
  findByUserId(userId: string): Promise<Amendment[]>;
  findAll(): Promise<Amendment[]>;
  findUnseenResolvedByUserId(userId: string): Promise<Amendment | null>;
  findPendingByUserId(userId: string): Promise<Amendment | null>;
  countPending(): Promise<number>;
}

export const AMENDMENT_REPOSITORY = Symbol('AMENDMENT_REPOSITORY');
