export interface NewsViewProps {
  id: string;
  newsId: string;
  userId: string;
  viewedAt: Date;
}

export interface CreateNewsViewProps {
  newsId: string;
  userId: string;
}

export class NewsView {
  private constructor(private readonly props: NewsViewProps) {}

  static create(props: CreateNewsViewProps): NewsView {
    return new NewsView({
      ...props,
      id: '',
      viewedAt: new Date(),
    });
  }

  static reconstitute(props: NewsViewProps): NewsView {
    return new NewsView(props);
  }

  get id(): string { return this.props.id; }
  get newsId(): string { return this.props.newsId; }
  get userId(): string { return this.props.userId; }
  get viewedAt(): Date { return new Date(this.props.viewedAt.getTime()); }
}
