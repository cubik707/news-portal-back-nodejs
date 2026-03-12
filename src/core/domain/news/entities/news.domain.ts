import { uuidv7 } from 'uuidv7';
import { Category } from '../../category/entities/category.domain';
import type { Tag } from '../../tag/entities/tag.domain';
import { User } from '../../user/entities/user.domain';
import { NewsStatus } from '../../../shared/enums/news-status.enum';

export interface NewsProps {
  id: string;
  title: string;
  content: string;
  image?: string;
  author: User;
  category: Category;
  status: NewsStatus;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
}

export interface CreateNewsProps {
  title: string;
  content: string;
  image?: string;
  author: User;
  category: Category;
  status?: NewsStatus;
  scheduledAt?: Date;
  tags: Tag[];
}

export class News {
  private constructor(private readonly props: NewsProps) {}

  /** Factory for creating a brand-new (not yet persisted) news item. */
  static create(props: CreateNewsProps): News {
    const now = new Date();
    return new News({
      ...props,
      id: uuidv7(),
      status: props.status ?? NewsStatus.draft,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Factory for reconstructing a news item loaded from persistence. */
  static reconstitute(props: NewsProps): News {
    return new News(props);
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get image(): string | undefined {
    return this.props.image;
  }

  get author(): User {
    return this.props.author;
  }

  get category(): Category {
    return this.props.category;
  }

  get status(): NewsStatus {
    return this.props.status;
  }

  get publishedAt(): Date | undefined {
    return this.props.publishedAt ? new Date(this.props.publishedAt.getTime()) : undefined;
  }

  get scheduledAt(): Date | undefined {
    return this.props.scheduledAt ? new Date(this.props.scheduledAt.getTime()) : undefined;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt.getTime());
  }

  get tags(): Tag[] {
    return this.props.tags;
  }

  // ── Business methods ───────────────────────────────────────────────────────

  publish(): void {
    this.props.status = NewsStatus.published;
    this.props.publishedAt = new Date();
    this.props.updatedAt = new Date();
  }

  archive(): void {
    this.props.status = NewsStatus.archived;
    this.props.updatedAt = new Date();
  }

  updateContent(data: {
    title?: string;
    content?: string;
    image?: string;
    category?: Category;
    tags?: Tag[];
    status?: NewsStatus;
    scheduledAt?: Date;
  }): void {
    if (data.title !== undefined) this.props.title = data.title;
    if (data.content !== undefined) this.props.content = data.content;
    if (data.image !== undefined) this.props.image = data.image;
    if (data.category !== undefined) this.props.category = data.category;
    if (data.tags !== undefined) this.props.tags = [...data.tags];
    if (data.status !== undefined) this.props.status = data.status;
    if (data.scheduledAt !== undefined) this.props.scheduledAt = data.scheduledAt;
    this.props.updatedAt = new Date();
  }
}
