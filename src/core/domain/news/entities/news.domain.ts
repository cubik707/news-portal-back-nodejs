import { CategoryDomain } from '../../category/entities/category.domain';
import { TagDomain } from '../../tag/entities/tag.domain';
import { UserDomain } from '../../user/entities/user.domain';
import { NewsStatus } from '../../../shared/enums/news-status.enum';

export interface NewsProps {
  id: number;
  title: string;
  content: string;
  image?: string;
  author: UserDomain;
  category: CategoryDomain;
  status: NewsStatus;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: TagDomain[];
}

export interface CreateNewsProps {
  title: string;
  content: string;
  image?: string;
  author: UserDomain;
  category: CategoryDomain;
  status?: NewsStatus;
  scheduledAt?: Date;
  tags: TagDomain[];
}

export class NewsDomain {
  private readonly _id: number | undefined;
  private _title: string;
  private _content: string;
  private _image?: string;
  private _author: UserDomain;
  private _category: CategoryDomain;
  private _status: NewsStatus;
  private _publishedAt?: Date;
  private _scheduledAt?: Date;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _tags: TagDomain[];

  private constructor(props: Omit<NewsProps, 'id'> & { id?: number }) {
    this._id = props.id;
    this._title = props.title;
    this._content = props.content;
    this._image = props.image;
    this._author = props.author;
    this._category = props.category;
    this._status = props.status;
    this._publishedAt = props.publishedAt;
    this._scheduledAt = props.scheduledAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._tags = [...props.tags];
  }

  /** Factory for creating a brand-new (not yet persisted) news item. */
  static create(props: CreateNewsProps): NewsDomain {
    const now = new Date();
    return new NewsDomain({
      ...props,
      status: props.status ?? NewsStatus.draft,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Factory for reconstructing a news item loaded from persistence. */
  static reconstitute(props: NewsProps): NewsDomain {
    return new NewsDomain(props);
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  get id(): number | undefined {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get image(): string | undefined {
    return this._image;
  }

  get author(): UserDomain {
    return this._author;
  }

  get category(): CategoryDomain {
    return this._category;
  }

  get status(): NewsStatus {
    return this._status;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  get scheduledAt(): Date | undefined {
    return this._scheduledAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get tags(): TagDomain[] {
    return [...this._tags];
  }

  // ── Business methods ───────────────────────────────────────────────────────

  publish(): void {
    this._status = NewsStatus.published;
    this._publishedAt = new Date();
    this._updatedAt = new Date();
  }

  archive(): void {
    this._status = NewsStatus.archived;
    this._updatedAt = new Date();
  }

  updateContent(data: {
    title?: string;
    content?: string;
    image?: string;
    category?: CategoryDomain;
    tags?: TagDomain[];
    status?: NewsStatus;
    scheduledAt?: Date;
  }): void {
    if (data.title !== undefined) this._title = data.title;
    if (data.content !== undefined) this._content = data.content;
    if (data.image !== undefined) this._image = data.image;
    if (data.category !== undefined) this._category = data.category;
    if (data.tags !== undefined) this._tags = [...data.tags];
    if (data.status !== undefined) this._status = data.status;
    if (data.scheduledAt !== undefined) this._scheduledAt = data.scheduledAt;
    this._updatedAt = new Date();
  }
}
