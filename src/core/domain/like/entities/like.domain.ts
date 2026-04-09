export interface LikeProps {
  id: string;
  newsId: string;
  userId: string;
  createdAt: Date;
}

export interface CreateLikeProps {
  newsId: string;
  userId: string;
}

export class Like {
  private constructor(private readonly props: LikeProps) {}

  static create(props: CreateLikeProps): Like {
    return new Like({
      ...props,
      id: '',          // assigned by DB (gen_random_uuid)
      createdAt: new Date(),
    });
  }

  static reconstitute(props: LikeProps): Like {
    return new Like(props);
  }

  get id(): string { return this.props.id; }
  get newsId(): string { return this.props.newsId; }
  get userId(): string { return this.props.userId; }
  get createdAt(): Date { return new Date(this.props.createdAt.getTime()); }
}
