import { randomUUID } from 'crypto';

export interface CategoryProps {
  id: string;
  name: string;
}

export class Category {
  private constructor(private readonly props: CategoryProps) {}

  static create(name: string): Category {
    return new Category({ id: randomUUID(), name });
  }

  static reconstitute(props: CategoryProps): Category {
    return new Category(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  updateName(name: string): void {
    this.props.name = name;
  }
}
