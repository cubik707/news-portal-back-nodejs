import { Test, TestingModule } from '@nestjs/testing';
import { CreateTagUseCase } from './create-tag.use-case';
import { GetAllTagsUseCase } from './get-all-tags.use-case';
import { GetTagByIdUseCase } from './get-tag-by-id.use-case';
import { GetLastThreeTagsUseCase } from './get-last-three-tags.use-case';
import { TAG_REPOSITORY } from '../../../core/domain/tag/repositories/tag.repository.interface';
import { Tag } from '../../../core/domain/tag/entities/tag.domain';
import { TagNotFoundException } from '../../../core/domain/tag/exceptions/tag-not-found.exception';

const makeTag = (id = 'tag-id', name = 'NestJS') => Tag.reconstitute({ id, name });

// ─── CreateTagUseCase ────────────────────────────────────────────────────────

describe('CreateTagUseCase', () => {
  let useCase: CreateTagUseCase;
  let tagRepository: { save: jest.Mock };

  beforeEach(async () => {
    tagRepository = { save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTagUseCase,
        { provide: TAG_REPOSITORY, useValue: tagRepository },
      ],
    }).compile();

    useCase = module.get(CreateTagUseCase);
  });

  it('should create and return a new tag', async () => {
    const tag = makeTag();
    tagRepository.save.mockResolvedValue(tag);

    const result = await useCase.execute('NestJS');

    expect(result).toBe(tag);
    expect(tagRepository.save).toHaveBeenCalledWith(expect.any(Tag));
  });
});

// ─── GetAllTagsUseCase ───────────────────────────────────────────────────────

describe('GetAllTagsUseCase', () => {
  let useCase: GetAllTagsUseCase;
  let tagRepository: { findAll: jest.Mock };

  beforeEach(async () => {
    tagRepository = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllTagsUseCase,
        { provide: TAG_REPOSITORY, useValue: tagRepository },
      ],
    }).compile();

    useCase = module.get(GetAllTagsUseCase);
  });

  it('should return all tags', async () => {
    const tags = [makeTag('1', 'NestJS'), makeTag('2', 'TypeORM')];
    tagRepository.findAll.mockResolvedValue(tags);

    const result = await useCase.execute();

    expect(result).toEqual(tags);
    expect(tagRepository.findAll).toHaveBeenCalled();
  });

  it('should return empty array when no tags exist', async () => {
    tagRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});

// ─── GetTagByIdUseCase ───────────────────────────────────────────────────────

describe('GetTagByIdUseCase', () => {
  let useCase: GetTagByIdUseCase;
  let tagRepository: { findById: jest.Mock };

  beforeEach(async () => {
    tagRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTagByIdUseCase,
        { provide: TAG_REPOSITORY, useValue: tagRepository },
      ],
    }).compile();

    useCase = module.get(GetTagByIdUseCase);
  });

  it('should return a tag when found', async () => {
    const tag = makeTag();
    tagRepository.findById.mockResolvedValue(tag);

    const result = await useCase.execute('tag-id');

    expect(result).toBe(tag);
    expect(tagRepository.findById).toHaveBeenCalledWith('tag-id');
  });

  it('should throw TagNotFoundException when tag does not exist', async () => {
    tagRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad-id')).rejects.toThrow(TagNotFoundException);
  });
});

// ─── GetLastThreeTagsUseCase ─────────────────────────────────────────────────

describe('GetLastThreeTagsUseCase', () => {
  let useCase: GetLastThreeTagsUseCase;
  let tagRepository: { findLastThree: jest.Mock };

  beforeEach(async () => {
    tagRepository = { findLastThree: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLastThreeTagsUseCase,
        { provide: TAG_REPOSITORY, useValue: tagRepository },
      ],
    }).compile();

    useCase = module.get(GetLastThreeTagsUseCase);
  });

  it('should return the last three tags', async () => {
    const tags = [makeTag('3', 'C'), makeTag('2', 'B'), makeTag('1', 'A')];
    tagRepository.findLastThree.mockResolvedValue(tags);

    const result = await useCase.execute();

    expect(result).toEqual(tags);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(tagRepository.findLastThree).toHaveBeenCalled();
  });
});
