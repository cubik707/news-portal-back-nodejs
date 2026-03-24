import { randomUUID } from 'crypto';

export interface TagProps {
  id: string;
  name: string;
}

export class Tag {
  private constructor(private readonly props: TagProps) {}

  static create(name: string): Tag {
    return new Tag({ id: randomUUID(), name });
  }

  static reconstitute(props: TagProps): Tag {
    return new Tag(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }
}
