export class PasswordHash {
  private readonly _value: string;

  private constructor(hash: string) {
    this._value = hash;
  }

  static fromHash(hash: string): PasswordHash {
    if (!hash) throw new Error('Password hash cannot be empty');
    return new PasswordHash(hash);
  }

  getValue(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}
