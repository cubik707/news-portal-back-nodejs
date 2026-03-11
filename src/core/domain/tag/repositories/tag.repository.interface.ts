import { TagDomain } from '../entities/tag.domain';

export interface ITagRepository {
  findAll(): Promise<TagDomain[]>;
  findById(id: number): Promise<TagDomain | null>;
  findLastThree(): Promise<TagDomain[]>;
  save(tag: Partial<TagDomain>): Promise<TagDomain>;
}

export const TAG_REPOSITORY = Symbol('TAG_REPOSITORY');
