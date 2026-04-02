import { uuidv7 } from 'uuidv7';
import { User } from '../../user/entities/user.domain';

export interface CommentProps {
  id: string;
  content: string;
  author: User;
  newsId: string;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
}

export interface CreateCommentProps {
  content: string;
  author: User;
  newsId: string;
}

export class Comment {
  private constructor(private readonly props: CommentProps) {}

  static create(props: CreateCommentProps): Comment {
    const now = new Date();
    return new Comment({
      ...props,
      id: uuidv7(),
      createdAt: now,
      updatedAt: now,
      editedAt: undefined,
    });
  }

  static reconstitute(props: CommentProps): Comment {
    return new Comment(props);
  }

  get id(): string {
    return this.props.id;
  }

  get content(): string {
    return this.props.content;
  }

  get author(): User {
    return this.props.author;
  }

  get newsId(): string {
    return this.props.newsId;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt.getTime());
  }

  get editedAt(): Date | undefined {
    return this.props.editedAt ? new Date(this.props.editedAt.getTime()) : undefined;
  }

  updateContent(newContent: string): void {
    if (!newContent || newContent.length < 1 || newContent.length > 2000) {
      throw new Error('Comment content must be between 1 and 2000 characters');
    }
    const now = new Date();
    this.props.content = newContent;
    this.props.editedAt = now;
    this.props.updatedAt = now;
  }
}
