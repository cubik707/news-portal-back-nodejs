export class TagDomain {
  private readonly _id: number | undefined;
  private readonly _name: string;

  private constructor(id: number | undefined, name: string) {
    this._id = id;
    this._name = name;
  }

  static create(name: string): TagDomain {
    return new TagDomain(undefined, name);
  }

  static reconstitute(id: number, name: string): TagDomain {
    return new TagDomain(id, name);
  }

  get id(): number | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }
}
