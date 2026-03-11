export class CategoryDomain {
  private readonly _id: number | undefined;
  private _name: string;

  private constructor(id: number | undefined, name: string) {
    this._id = id;
    this._name = name;
  }

  static create(name: string): CategoryDomain {
    return new CategoryDomain(undefined, name);
  }

  static reconstitute(id: number, name: string): CategoryDomain {
    return new CategoryDomain(id, name);
  }

  get id(): number | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  updateName(name: string): void {
    this._name = name;
  }
}
