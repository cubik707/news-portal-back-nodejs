import { Tag } from '../entities/tag.domain';

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
  findById(id: string): Promise<Tag | null>;
  findByIds(ids: string[]): Promise<Tag[]>;
  findLastThree(): Promise<Tag[]>;
  save(tag: Tag): Promise<Tag>;
}

export const TAG_REPOSITORY = Symbol('TAG_REPOSITORY');
